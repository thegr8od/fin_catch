package com.finbattle.global.common.config;

import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.domain.cat.entity.CatGrade;
import com.finbattle.domain.cat.repository.CatRepository;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final CatRepository catRepository;

    private static final String CAT_ASSET_FILE = "cat_asset/cat_asset.txt";

    // 📌 등급별 고양이 폴더 이름 정의
    private static final Set<String> EPIC_CATS = Set.of("demonic", "christmas", "batman");
    private static final Set<String> LEGENDARY_CATS = Set.of("unique_rabbit", "tiger");

    @Override
    public void run(ApplicationArguments args) {
        try {
            // 📂 cat_asset.txt 파일을 읽기
            ClassPathResource resource = new ClassPathResource(CAT_ASSET_FILE);
            if (!resource.exists()) {
                log.error("📂 cat_asset.txt 파일을 찾을 수 없습니다!");
                return;
            }

            // 📂 파일에서 고양이 이름 목록 가져오기
            List<String> folderNames;
            try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream()))) {
                folderNames = reader.lines().collect(Collectors.toList());
            }

            // 📂 이미 저장된 고양이 이름 조회
            List<String> existingCats = catRepository.findAll().stream()
                .map(Cat::getCatName)
                .collect(Collectors.toList());

            // 🐱 DB에 없는 고양이만 추가
            List<Cat> newCats = folderNames.stream()
                .filter(name -> !existingCats.contains(name)) // 중복 방지
                .map(name -> new Cat(name, determineCatGrade(name))) // Cat 객체 생성
                .collect(Collectors.toList());

            if (!newCats.isEmpty()) {
                catRepository.saveAll(newCats); // 🚀 한 번의 쿼리로 저장
                log.info("{}마리의 고양이가 추가되었습니다!", newCats.size());
            } else {
                log.info("새로운 고양이가 없습니다.");
            }

        } catch (IOException e) {
            log.error("고양이 폴더를 읽는 중 오류가 발생했습니다.", e);
        }
    }

    // 📌 고양이 등급을 결정하는 메서드
    private CatGrade determineCatGrade(String catName) {
        if (LEGENDARY_CATS.contains(catName)) {
            return CatGrade.LEGENDARY;
        } else if (EPIC_CATS.contains(catName)) {
            return CatGrade.EPIC;
        } else if (catName.equals("classic")) {
            return CatGrade.DEFAULT;
        } else {
            return CatGrade.COMMON; // 기본값
        }
    }
}
