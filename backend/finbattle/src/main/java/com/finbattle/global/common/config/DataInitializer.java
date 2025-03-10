package com.finbattle.global.common.config;

import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.domain.cat.repository.CatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final CatRepository catRepository;

    @Override
    public void run(ApplicationArguments args) {
        // 1번 고양이가 존재하지 않으면 추가
        if (!catRepository.existsById(1L)) {
            Cat defaultCat = new Cat();
            //defaultCat.setCatId(1L);  // ID를 1로 설정 (기본값)
            defaultCat.setCatName("기본 고양이");
            catRepository.save(defaultCat);
        }
        Cat defaultCat = catRepository.findById(1L).orElseThrow();
    }
}
