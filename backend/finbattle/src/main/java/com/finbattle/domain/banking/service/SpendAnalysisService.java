package com.finbattle.domain.banking.service;

import com.finbattle.domain.banking.model.CategorySpending;
import com.finbattle.domain.banking.model.SpendAnalysis;
import com.finbattle.domain.banking.model.TransactionRecord;
import com.finbattle.domain.banking.repository.SpendAnalysisRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 주입
@Slf4j // 로깅을 위한 Lombok 어노테이션
public class SpendAnalysisService {

    private final SpendAnalysisRepository spendAnalysisRepository;

    // --- 필요한 다른 서비스들 주입 ---
    // @Autowired // 또는 @RequiredArgsConstructor를 통한 생성자 주입
    // private final TransactionFetcherService transactionFetcherService; // 1단계: 거래 내역 조회 서비스

    // @Autowired // 또는 생성자 주입
    // private final TransactionClassifierService transactionClassifierService; // 2단계: AI 분류 서비스

    // @Autowired // 또는 생성자 주입
    // private final GptAnalysisService gptAnalysisService; // 4단계: GPT 분석 요청 서비스


    // --- 임시 데이터 구조 (실제 DTO/모델로 교체 필요) ---
    // 1단계에서 조회된 원시 거래 데이터 예시
    private static class RawTransaction {

        LocalDate date;
        String details;
        long amount;
        String storeName; // 가맹점명 등 추가 정보 예시
    }

    // 2단계 AI 분류 결과 예시
    private static class ClassifiedTransactions {

        String category; // 예: "식비", "교통"
        RawTransaction transaction;
    }
    // --- 임시 데이터 구조 끝 ---


    /**
     * 주어진 회원 ID에 대한 소비 분석 프로세스를 수행합니다. 1. 거래 내역 조회 2. AI를 이용한 거래 내역 분류 3. 결과를 SpendAnalysis DTO로 집계
     * 4. 결과를 Redis에 저장 5. 결과를 GPT에 전송 (분석 요청)
     *
     * @param memberId 소비 분석을 수행할 회원의 ID
     * @return 생성된 SpendAnalysis 객체
     */
    // 거래 내역 조회/저장 시 DB 트랜잭션이 필요하다면 @Transactional 추가
    public SpendAnalysis analyzeAndStoreSpend(Long memberId) {
        log.info("회원 ID: {} 에 대한 소비 분석 시작", memberId);

        // 1. 거래 내역 조회 (실제 서비스 호출로 대체 필요)
        List<RawTransaction> allTransactions = fetchTransactionsForMember(memberId);
        if (allTransactions.isEmpty()) {
            log.warn("회원 ID: {} 에 대한 거래 내역 없음. 분석 건너뜀.", memberId);
            // 데이터가 없을 경우 빈 분석 객체 또는 특정 상태를 나타내는 객체 반환 고려
            SpendAnalysis emptyAnalysis = SpendAnalysis.builder()
                .memberId(memberId)
                .categorySpendings(new HashMap<>()) // 빈 맵 설정
                .build();
            spendAnalysisRepository.save(emptyAnalysis); // 빈 상태 저장
            return emptyAnalysis;
        }
        log.info("회원 ID: {} 에 대한 거래 내역 {} 건 조회 완료", memberId, allTransactions.size());

        // 2. AI를 이용한 거래 내역 분류 (실제 서비스 호출로 대체 필요)
        List<ClassifiedTransactions> classifiedResults = classifyTransactions(allTransactions);
        log.info("회원 ID: {} 에 대한 거래 내역 분류 완료", memberId);

        // 3. SpendAnalysis 객체로 결과 집계
        Map<String, SpendAnalysis.CategorySpending> categorySpendingsMap = processClassifiedTransactions(
            classifiedResults);

        // 4. SpendAnalysis 객체 생성 및 Redis 저장
        SpendAnalysis spendAnalysis = SpendAnalysis.builder()
            .memberId(memberId)
            .categorySpendings(categorySpendingsMap)
            // .ttl(2L) // 필요시 기본 TTL(1일) 대신 다른 값(예: 2일) 설정 가능
            .build();

        SpendAnalysis savedAnalysis = spendAnalysisRepository.save(spendAnalysis);
        log.info("회원 ID: {} 에 대한 SpendAnalysis Redis 저장 완료", memberId);

        // 5. GPT에 전송 (실제 서비스 호출로 대체 필요 - 비동기 실행 고려)
        // 사용자 응답 시간을 줄이기 위해 이 부분은 비동기적으로 처리하는 것이 좋습니다.
        // submitToGpt(savedAnalysis); // 비동기 GPT 제출 예시
        log.info("회원 ID: {} 에 대한 SpendAnalysis GPT 분석 요청 제출", memberId);

        // Redis에 저장된 분석 객체 반환
        return savedAnalysis;
    }

    /**
     * Redis에서 SpendAnalysis 데이터를 조회합니다.
     *
     * @param memberId 회원 ID
     * @return 조회된 SpendAnalysis 객체를 포함하는 Optional (없을 경우 empty)
     */
    public Optional<SpendAnalysis> getSpendAnalysis(Long memberId) {
        log.debug("Redis에서 회원 ID: {} 에 대한 SpendAnalysis 조회 시도", memberId);
        // findById 또는 직접 정의한 findByMemberId 사용
        return spendAnalysisRepository.findByMemberId(memberId);
        // return spendAnalysisRepository.findById(memberId);
    }

    // =======================================================================
    // 임시 메소드들 - 실제 서비스 호출 로직으로 반드시 교체해야 합니다!
    // =======================================================================

    private List<RawTransaction> fetchTransactionsForMember(Long memberId) {
        log.debug("1단계: 회원 ID {} 거래 내역 조회 (임시 구현)", memberId);
        // 실제 로직: return transactionFetcherService.getAllTransactions(memberId);
        // 더미 데이터 예시:
        List<RawTransaction> dummyTransactions = new ArrayList<>();
        RawTransaction t1 = new RawTransaction();
        t1.date = LocalDate.now().minusDays(1);
        t1.details = "스타벅스 강남점";
        t1.amount = 5500;
        t1.storeName = "스타벅스";
        RawTransaction t2 = new RawTransaction();
        t2.date = LocalDate.now().minusDays(2);
        t2.details = "GS25 편의점";
        t2.amount = 1500;
        t2.storeName = "GS25";
        RawTransaction t3 = new RawTransaction();
        t3.date = LocalDate.now().minusDays(1);
        t3.details = "카카오택시";
        t3.amount = 12000;
        t3.storeName = "카카오T";
        RawTransaction t4 = new RawTransaction();
        t4.date = LocalDate.now().minusDays(3);
        t4.details = "전기요금";
        t4.amount = 35000;
        t4.storeName = "한국전력";
        dummyTransactions.add(t1);
        dummyTransactions.add(t2);
        dummyTransactions.add(t3);
        dummyTransactions.add(t4);
        return dummyTransactions;
    }

    private List<ClassifiedTransactions> classifyTransactions(List<RawTransaction> transactions) {
        log.debug("2단계: AI를 이용한 거래 내역 분류 (임시 구현)");
        // 실제 로직: return transactionClassifierService.classify(transactions);
        // 더미 분류 로직 예시:
        List<ClassifiedTransactions> classified = new ArrayList<>();
        for (RawTransaction tx : transactions) {
            ClassifiedTransactions ct = new ClassifiedTransactions();
            ct.transaction = tx;
            if (tx.storeName != null) {
                if (tx.storeName.contains("스타벅스") || tx.storeName.contains("편의점")
                    || tx.storeName.contains("GS25")) {
                    ct.category = "식비";
                } else if (tx.storeName.contains("택시") || tx.storeName.contains("카카오T")) {
                    ct.category = "교통";
                } else if (tx.storeName.contains("전력") || tx.storeName.contains("가스")) {
                    ct.category = "주거";
                } else {
                    ct.category = "기타";
                }
            } else {
                ct.category = "기타"; // 가맹점 정보 없으면 '기타'로 분류
            }
            classified.add(ct);
        }
        return classified;
    }

    private Map<String, CategorySpending> processClassifiedTransactions(
        List<ClassifiedTransactions> classifiedResults) {
        log.debug("3단계: 분류된 거래 내역 처리 (임시 구현)");
        // 카테고리별로 거래 내역 그룹화
        Map<String, List<ClassifiedTransactions>> groupedByCategory = classifiedResults.stream()
            .collect(
                Collectors.groupingBy(ClassifiedTransactions::getCategory)); // getCategory 메소드 필요

        Map<String, CategorySpending> categorySpendingsMap = new HashMap<>();

        // 각 카테고리와 해당 거래 내역들을 순회
        groupedByCategory.forEach((category, transactionsInCategory) -> {
            // 해당 카테고리의 총 지출액 계산
            long totalAmount = transactionsInCategory.stream()
                .mapToLong(ct -> ct.getTransaction().amount) // getTransaction 메소드 필요
                .sum();

            // RawTransaction을 TransactionDetail 객체로 변환
            List<TransactionRecord> transactionDetails = transactionsInCategory.stream()
                .map(ct -> TransactionRecord.Builder()
                    .transactionDate(ct.getTransaction().date)
                    .description(ct.getTransaction().details) // 또는 storeName 등 사용
                    .amount(ct.getTransaction().amount)
                    .build())
                .collect(Collectors.toList());

            // CategorySpending 객체 생성
            CategorySpending categorySpending = CategorySpending.builder()
                .totalAmount(totalAmount) // 총합 설정
                .transactions(transactionDetails) // 거래 내역 리스트 설정
                .build();

            // 최종 결과 맵에 추가
            categorySpendingsMap.put(category, categorySpending);
        });

        return categorySpendingsMap;
    }

    // GPT 전송 임시 메소드
    private void submitToGpt(SpendAnalysis analysis) {
        log.debug("5단계: GPT 분석 요청 제출 (임시 구현) - 회원 ID: {}", analysis.getMemberId());
        // 실제 로직: gptAnalysisService.requestAnalysis(analysis);
        // 여기에 비동기 처리(@Async) 적용 고려
    }

    // 임시 클래스들이 다른 곳에서 필요하다면 public으로 만들거나,
    // 각자의 패키지에 적절한 DTO로 정의하는 것이 좋습니다.
    public static class RawTransaction {

        LocalDate date;
        String details;
        long amount;
        String storeName;
    }

    public static class ClassifiedTransactions {

        String category;
        RawTransaction transaction;

        // Stream 처리에서 사용하기 위해 Getter 추가
        public String getCategory() {
            return category;
        }

        public RawTransaction getTransaction() {
            return transaction;
        }
    }
}