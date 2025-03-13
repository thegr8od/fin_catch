package com.finbattle.domain.member.service;

import static org.junit.jupiter.api.Assertions.assertTrue;

import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.domain.cat.entity.CatGrade;
import com.finbattle.global.common.exception.exception.BusinessException;
import jakarta.transaction.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Transactional // 테스트 환경에서는 한개 단위테스트가 진행되고 자동으로 롤백됨
@Slf4j
public class MemberServiceTest {

    @Autowired
    private MemberService memberService;

    private final Long testMemberId = 1L; // 테스트용 멤버 ID

    @Test
    public void pickCatTest() throws Exception {
        int testCount = 50000;

        Map<CatGrade, Integer> resultCount = new HashMap<>();
        resultCount.put(CatGrade.LEGENDARY, 0);
        resultCount.put(CatGrade.EPIC, 0);
        resultCount.put(CatGrade.COMMON, 0);
        List<Cat> pickedCats = memberService.pickCatList(testCount); // 🔹 MemberService에서 호출
        for (int i = 0; i < testCount; i++) {
            try {
                Cat pickedCat = pickedCats.get(i); // 🔹 MemberService에서 호출
                CatGrade grade = pickedCat.getGrade();
                resultCount.put(grade, resultCount.getOrDefault(grade, 0) + 1);
            } catch (BusinessException e) {
                log.warn("뽑기 실패: {}", e.getMessage());
            }
        }

        // 결과 출력
        log.info("===== 고양이 뽑기 테스트 ({}번 실행) =====", testCount);
        resultCount.forEach((grade, count) -> {
            double percentage = (count / (double) testCount) * 100;
            log.info("{}: {}번 ({}%)", grade, count, percentage);
        });

        // 확률 검증 (범위를 벗어나지 않는지)
        assertTrue(resultCount.get(CatGrade.LEGENDARY) >= 400
                && resultCount.get(CatGrade.LEGENDARY) <= 600,
            "LEGENDARY 뽑기 확률 범위를 벗어남"); // 예상 500

        assertTrue(resultCount.get(CatGrade.EPIC) >= 4500 && resultCount.get(CatGrade.EPIC) <= 5500,
            "EPIC 뽑기 확률 범위를 벗어남"); // 예상 5000

        assertTrue(
            resultCount.get(CatGrade.COMMON) >= 43500 && resultCount.get(CatGrade.COMMON) <= 45500,
            "COMMON 뽑기 확률 범위를 벗어남"); // 예상 44500
    }

}