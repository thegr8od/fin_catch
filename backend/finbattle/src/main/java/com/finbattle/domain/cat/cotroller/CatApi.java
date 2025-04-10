package com.finbattle.domain.cat.cotroller;


import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.global.common.model.dto.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Tag(name = "고양이 API", description = "고양이 조회 기능을 제공하는 컨트롤러")
@RequestMapping("/api/cat")
public interface CatApi {

    @Operation(summary = "전체 고양이 조회", description = "전체 고양이 목록을 조회합니다.")
    @GetMapping("/public/all")
    ResponseEntity<BaseResponse<List<Cat>>> findAll();

    @Operation(summary = "ID로 고양이 조회", description = "고양이 ID를 이용해 고양이를 조회합니다.")
    @GetMapping("/public/{catId}")
    ResponseEntity<BaseResponse<Cat>> findByCatId(@PathVariable Long catId);
}
