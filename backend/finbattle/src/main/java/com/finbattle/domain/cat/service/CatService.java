package com.finbattle.domain.cat.service;

import static com.finbattle.global.common.model.dto.BaseResponseStatus.CAT_NOT_FOUND;

import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.domain.cat.repository.CatRepository;
import com.finbattle.global.common.exception.exception.BusinessException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CatService {

    private final CatRepository catRepository;

    // 1. 전체 고양이 조회
    public List<Cat> findAll() {
        return catRepository.findAll();
    }

    // 2. 고양이 ID로 조회
    public Cat findByCatId(Long catId) {
        return catRepository.findByCatId(catId)
            .orElseThrow(() -> new BusinessException(CAT_NOT_FOUND));
    }

}
