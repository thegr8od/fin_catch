package com.finbattle.domain.member.controller;

import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.domain.member.dto.CatDto;
import com.finbattle.domain.member.dto.MyInfoDto;
import com.finbattle.domain.oauth.dto.AuthenticatedUser;
import com.finbattle.global.common.model.dto.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "회원 API", description = "회원 관련 기능을 제공하는 컨트롤러")
@RequestMapping("/api/member")
public interface MemberApi {

    @Operation(summary = "내 정보 조회", description = "로그인한 사용자의 정보를 반환합니다.", security = @SecurityRequirement(name = "JWT"))
    @ApiResponse(responseCode = "200", description = "사용자 정보 조회 성공")
    @GetMapping("/myinfo")
    ResponseEntity<BaseResponse<MyInfoDto>> login(
        @AuthenticationPrincipal AuthenticatedUser detail);

    @Operation(summary = "로그아웃", description = "로그아웃 후 리프레시 토큰을 제거합니다.")
    @ApiResponse(responseCode = "200", description = "로그아웃 성공")
    @PostMapping("/logout")
    ResponseEntity<BaseResponse<String>> logout(
        @AuthenticationPrincipal AuthenticatedUser detail,
        @Parameter(hidden = true) @CookieValue(value = "REFRESH", required = false) String refresh,
        HttpServletResponse response
    );

    @Operation(summary = "Access Token 재발급", description = "리프레시 토큰을 이용하여 새로운 액세스 토큰을 발급합니다.")
    @ApiResponse(responseCode = "200", description = "Access Token 재발급 성공")
    @GetMapping("/public/reissue")
    ResponseEntity<BaseResponse<Map<String, String>>> refreshSuccess(
        @Parameter(hidden = true) @CookieValue(value = "REFRESH", required = false) String refresh,
        HttpServletResponse response
    );

    @Operation(summary = "메인 고양이 변경", description = "사용자의 대표 고양이를 변경합니다.")
    @ApiResponse(responseCode = "200", description = "대표 고양이 변경 성공")
    @PatchMapping("/maincat")
    ResponseEntity<BaseResponse<Cat>> updateMainCat(
        @AuthenticationPrincipal AuthenticatedUser detail,
        @RequestParam Long catId
    );

    @Operation(summary = "닉네임 변경", description = "사용자의 닉네임을 변경합니다.")
    @ApiResponse(responseCode = "200", description = "닉네임 변경 성공")
    @PatchMapping("/nickname")
    ResponseEntity<BaseResponse<String>> updateNickname(
        @AuthenticationPrincipal AuthenticatedUser detail,
        @RequestParam String nickname
    );

    @Operation(summary = "닉네임 중복 확인", description = "입력한 닉네임이 사용 가능한지 확인합니다.")
    @ApiResponse(responseCode = "200", description = "닉네임 중복 확인 완료")
    @GetMapping("/public/nickname")
    ResponseEntity<BaseResponse<Boolean>> getNickname(@RequestParam String nickname);

    @Operation(summary = "사용자의 고양이 목록 조회", description = "로그인한 사용자가 보유한 고양이 목록을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "고양이 목록 조회 성공")
    @GetMapping("/mycat")
    ResponseEntity<BaseResponse<List<Cat>>> getMyCats(
        @AuthenticationPrincipal AuthenticatedUser detail);

    @Operation(summary = "랜덤 고양이 뽑기", description = "로그인한 사용자가 랜덤으로 고양이를 뽑습니다.")
    @ApiResponse(responseCode = "200", description = "랜덤 고양이 뽑기 성공")
    @GetMapping("/pick/cat")
    ResponseEntity<BaseResponse<List<CatDto>>> pickCat(
        @AuthenticationPrincipal AuthenticatedUser detail,
        @RequestParam Integer count
    );
}
