package com.finbattle.domain.cat.cotroller;

import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.domain.cat.service.CatService;
import com.finbattle.global.common.model.dto.BaseResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
public class CatController implements CatApi {

    private final CatService catService;

    @Override
    public ResponseEntity<BaseResponse<List<Cat>>> findAll() {
        List<Cat> catList = catService.findAll();
        log.info("전체 고양이 조회: {}마리", catList.size());
        return ResponseEntity.ok(new BaseResponse<>(catList));
    }

    @Override
    public ResponseEntity<BaseResponse<Cat>> findByCatId(Long catId) {
        Cat cat = catService.findByCatId(catId);
        log.info("고양이 ID {} 조회: {}", catId, cat);
        return ResponseEntity.ok(new BaseResponse<>(cat));
    }
}
