package com.finbattle.domain.banking.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.domain.banking.dto.analysis.KeywordCategoryMapping;
import com.finbattle.domain.banking.model.SpendCategory;
import com.finbattle.domain.banking.model.SpendCategoryEntity;
import com.finbattle.domain.banking.model.TransactionList;
import com.finbattle.domain.banking.model.TransactionRecord;
import com.finbattle.domain.banking.repository.AiCategoryRepository;
import com.finbattle.domain.banking.repository.CategoryRepository;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 주입
@Slf4j // 로깅을 위한 Lombok 어노테이션
public class SpendAnalysisService {

    private final CategoryRepository categoryRepository;
    private final AiCategoryRepository aiCategoryRepository;

    public String analysisSpend(Map<String, TransactionList> transactionLists)
        throws JsonProcessingException {
        Map<String, List<TransactionRecord>> recordByAccount = convertTransactionData(
            transactionLists);

        log.info("계좌별 거래 내역 조회 완료. 총 계좌 수: {}", recordByAccount.size());

        Map<String, SpendCategoryEntity> summarysAddCategory = classifyTransactionSummaries(
            recordByAccount);

        // 3. 카테고리별 소비 집계
        Map<SpendCategory, Long> categories = summarizeAmountByCategory(recordByAccount,
            summarysAddCategory);

        ObjectMapper objectMapper = new ObjectMapper();
        String json = objectMapper.writeValueAsString(categories);
        log.info("GPT 요청용 JSON: {}", json);

        return json;
    }

    private Map<String, List<TransactionRecord>> convertTransactionData(
        Map<String, TransactionList> data) {

        Map<String, List<TransactionRecord>> converted = new HashMap<>();
        for (Map.Entry<String, TransactionList> entry : data.entrySet()) {
            String accountNo = entry.getKey();
            TransactionList transactionList = entry.getValue();

            List<TransactionRecord> simplifiedRecords = transactionList.getList();
            log.info("{} 계좌 거래 내역: {}", accountNo, simplifiedRecords.size());
            converted.put(accountNo, simplifiedRecords);
        }
        return converted;
    }

    private Map<String, SpendCategoryEntity> classifyTransactionSummaries(
        Map<String, List<TransactionRecord>> recordsByAccount) {
        Set<String> summaries = recordsByAccount.values().stream()
            .flatMap(List::stream)
            .filter(record -> !record.getTransactionTypeName().contains("입금")) // 필터 조건 추가
            .map(TransactionRecord::getTransactionSummary)
            .collect(Collectors.toSet());

        // 1. DB에서 분류된 카테고리 가져오기
        List<KeywordCategoryMapping> mappings = categoryRepository.findKeywordCategoryMappings(
            summaries);

        Map<String, SpendCategoryEntity> summaryToCategory = mappings.stream()
            .collect(Collectors.toMap(
                KeywordCategoryMapping::getKeyword,
                mapping -> new SpendCategoryEntity(mapping.getKeyword(), mapping.getCategory())
            ));

        // 2. 분류되지 않은 키워드 2번 카데고리 테이블 조회
        Set<String> notFound = new HashSet<>(summaries);
        notFound.removeAll(summaryToCategory.keySet());

        List<KeywordCategoryMapping> aiMappings = aiCategoryRepository.findKeywordCategoryMappings(
            notFound);

        for (KeywordCategoryMapping mapping : aiMappings) {
            summaryToCategory.put(mapping.getKeyword(),
                new SpendCategoryEntity(mapping.getKeyword(), mapping.getCategory()));
        }

        Set<String> reallyNotFound = new HashSet<>(notFound);
        reallyNotFound.removeAll(
            aiMappings.stream().map(KeywordCategoryMapping::getKeyword).collect(Collectors.toSet())
        );

        // 3. FastAPI로 분류 요청
        Map<String, SpendCategoryEntity> newlyClassified = classifyWithFastApi(reallyNotFound);

        // 4. 결과 병합
        summaryToCategory.putAll(newlyClassified);

        log.info("카테고리 분류 완료. 총 거래 내역 수: {}, DB 분류: {}, AI 분류: {}", summaries.size(),
            summaries.size() - notFound.size(), notFound.size());

        return summaryToCategory;
    }

    private Map<String, SpendCategoryEntity> classifyWithFastApi(Set<String> summaries) {
        if (summaries.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, SpendCategoryEntity> result = new HashMap<>();

//        // FastAPI 서버에 요청 → 결과 예: { "스타벅스": "카페", "배달의민족": "식비" }
//        Map<String, String> resultFromFastApi = fastApiClient.classifyBulk(summaries);
//
//        List<SpendCategoryEntity> entitiesToSave = new ArrayList<>();
//
//        for (Map.Entry<String, String> entry : resultFromFastApi.entrySet()) {
//            String keyword = entry.getKey();
//            String label = entry.getValue();
//
//            SpendCategory categoryEnum = SpendCategory.fromLabel(label); // 한글 → Enum
//            SpendCategoryEntity entity = new SpendCategoryEntity(keyword, categoryEnum);
//
//            result.put(keyword, entity);     // 결과 map 추가
//            entitiesToSave.add(entity);     // DB 저장용 리스트 추가
//        }

//        aiCategoryRepository.save(entitiesToSave); // DB 저장
        return result;
    }

    private Map<SpendCategory, Long> summarizeAmountByCategory(
        Map<String, List<TransactionRecord>> recordByAccount,
        Map<String, SpendCategoryEntity> summaryToCategory
    ) {
        Map<SpendCategory, Long> summary = new HashMap<>();

        for (List<TransactionRecord> records : recordByAccount.values()) {
            for (TransactionRecord record : records) {
                // 출금만 대상으로 분석
                if (!"출금".equals(record.getTransactionTypeName())) {
                    continue;
                }

                String summaryText = record.getTransactionSummary();
                SpendCategoryEntity categoryEntity = summaryToCategory.get(summaryText);
                if (categoryEntity == null) {
                    continue;
                }

                SpendCategory category = categoryEntity.getCategory();
                long amount = record.getTransactionBalance();

                summary.merge(category, amount, Long::sum);
            }
        }

        return summary;
    }

}