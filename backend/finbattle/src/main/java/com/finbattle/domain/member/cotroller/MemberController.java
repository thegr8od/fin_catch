package com.finbattle.domain.member.cotroller;

import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.domain.member.dto.CatDto;
import com.finbattle.domain.member.dto.MyInfoDto;
import com.finbattle.domain.member.service.MemberService;
import com.finbattle.domain.oauth.dto.AuthenticatedUser;
import com.finbattle.domain.token.service.TokenService;
import com.finbattle.global.common.Util.CookieUtil;
import com.finbattle.global.common.model.dto.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "회원 API", description = "회원 관련 기능을 제공하는 컨트롤러")
public class MemberController {

    private final MemberService memberService;
    private final TokenService tokenService;
    private final CookieUtil cookieUtil;

    @Operation(summary = "내 정보 조회", description = "로그인한 사용자의 정보를 반환합니다.", security = @SecurityRequirement(name = "JWT"))
    @ApiResponse(responseCode = "200", description = "사용자 정보 조회 성공")
    @GetMapping("/myinfo")
    public ResponseEntity<BaseResponse<MyInfoDto>> login(
        @AuthenticationPrincipal AuthenticatedUser detail) {
        MyInfoDto myInfoDto = memberService.getMyInfo(detail.getMemberId());
        // loginService.setTokens(detail, response);
        log.info("사용자 정보: {}", myInfoDto.toString());
        return ResponseEntity.ok(new BaseResponse<>(myInfoDto));
    }

    @Operation(summary = "로그아웃", description = "로그아웃 후 리프레시 토큰을 제거합니다.")
    @ApiResponse(responseCode = "200", description = "로그아웃 성공")
    @PostMapping("/logout")
    public ResponseEntity<BaseResponse<String>> logout(
        @AuthenticationPrincipal AuthenticatedUser detail,
        @Parameter(hidden = true) @CookieValue(value = "REFRESH", required = false) String refresh,
        HttpServletResponse response) {

        Cookie refreshCookie = cookieUtil.createCookie("REFRESH", null);
        refreshCookie.setMaxAge(0);
        response.addCookie(refreshCookie);

        tokenService.deleteRefreshToken(refresh);
        log.info("로그아웃 성공! 사용자 정보: {}", detail.toString());
        return ResponseEntity.ok(new BaseResponse<>("Logout success!"));
    }

    @Operation(summary = "Access Token 재발급", description = "리프레시 토큰을 이용하여 새로운 액세스 토큰을 발급합니다.")
    @ApiResponse(responseCode = "200", description = "Access Token 재발급 성공")
    @GetMapping("/public/reissue")
    public ResponseEntity<BaseResponse<Map<String, String>>> refreshSuccess(
        @Parameter(hidden = true) @CookieValue(value = "REFRESH", required = false) String refresh,
        HttpServletResponse response) {
        String accessToken = tokenService.reissueAccessToken(refresh);

        log.info("AccessToken 재발급 성공! AccessToken: {}", accessToken);

        // 토큰 헤더에 삽입
        response.setHeader("Authorization", "Bearer " + accessToken);
        // ✅ Access Token을 JSON Body에 포함하여 반환
        Map<String, String> responseBody = new HashMap<>();
        responseBody.put("accessToken", accessToken);
        return ResponseEntity.ok(new BaseResponse<>(responseBody));
    }

    @Operation(summary = "닉네임 변경", description = "사용자의 닉네임을 변경합니다.")
    @ApiResponse(responseCode = "200", description = "닉네임 변경 성공")
    @PatchMapping("/nickname")
    public ResponseEntity<BaseResponse<String>> updateNickname(
        @AuthenticationPrincipal AuthenticatedUser detail, String nickname) {
        memberService.updateNickname(detail.getMemberId(), nickname);
        log.info("닉네임 변경 성공! 변경된 닉네임: {}", nickname);
        return ResponseEntity.ok(new BaseResponse<>("Nickname update success!"));
    }

    @Operation(summary = "닉네임 중복 확인", description = "입력한 닉네임이 사용 가능한지 확인합니다.")
    @ApiResponse(responseCode = "200", description = "닉네임 중복 확인 완료")
    @GetMapping("/public/nickname")
    public ResponseEntity<BaseResponse<Boolean>> getNickname(String nickname) {
        boolean check = memberService.findByNickname(nickname);
        if (check) {
            log.info("{} 닉네임은 이미 존재합니다.", nickname);
        } else {
            log.info("{} 닉네임은 사용 가능합니다.", nickname);
        }
        return ResponseEntity.ok(new BaseResponse<>(check));
    }

    @Operation(summary = "사용자의 고양이 목록 조회", description = "로그인한 사용자가 보유한 고양이 목록을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "고양이 목록 조회 성공")
    @GetMapping("/mycat")
    public ResponseEntity<BaseResponse<List<Cat>>> getMyCats(
        @AuthenticationPrincipal AuthenticatedUser detail) {
        List<Cat> cats = memberService.getCatIdsByMemberId(detail.getMemberId());
        log.info("사용자가 보유한 고양이 ID 목록: {}", cats);
        return ResponseEntity.ok(new BaseResponse<>(cats));
    }

    @Operation(summary = "랜덤 고양이 뽑기", description = "로그인한 사용자가 랜덤으로 고양이를 뽑습니다.")
    @ApiResponse(responseCode = "200", description = "랜덤 고양이 뽑기 성공")
    @GetMapping("/pick/cat")
    public ResponseEntity<BaseResponse<CatDto>> pickCat(
        @AuthenticationPrincipal AuthenticatedUser detail) {
        CatDto cat = memberService.pickCat(detail.getMemberId());
        log.info("{} 번 고양이를 뽑았습니다.", cat.getCatId());
        return ResponseEntity.ok(new BaseResponse<>(cat));
    }
}
