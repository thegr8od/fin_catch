package com.finbattle.domain.cat.cotroller;

import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.domain.cat.service.CatService;
import com.finbattle.global.common.model.dto.BaseResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cat")
@RequiredArgsConstructor
@Slf4j
public class CatController {

    private final CatService catService;

    @GetMapping("/public")
    // 1. 전체 고양이 조회
    public ResponseEntity<BaseResponse<List<Cat>>> findAll() {
        return ResponseEntity.ok(new BaseResponse<>(catService.findAll()));
    }

    @GetMapping("/public/{catId}")
    // 2. 고양이 ID로 조회
    public ResponseEntity<BaseResponse<Cat>> findByCatId(@PathVariable Long catId) {
        return ResponseEntity.ok(new BaseResponse<>(catService.findByCatId(catId)));
    }

}
