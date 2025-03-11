package com.finbattle.domain.member.cotroller;

import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.domain.member.dto.MyInfoDto;
import com.finbattle.domain.member.service.MemberService;
import com.finbattle.domain.oauth.dto.AuthenticatedUser;
import com.finbattle.domain.token.service.TokenService;
import com.finbattle.global.common.Util.CookieUtil;
import com.finbattle.global.common.model.dto.BaseResponse;
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
public class MemberController {

    private final MemberService memberService;
    private final TokenService tokenService;
    private final CookieUtil cookieUtil;

    @GetMapping("/myinfo")
    public ResponseEntity<BaseResponse<MyInfoDto>> login(
        @AuthenticationPrincipal AuthenticatedUser detail) {
        MyInfoDto myInfoDto = memberService.getMyInfo(detail.getMemberId());
        // loginService.setTokens(detail, response);
        log.info("사용자 정보: {}", myInfoDto.toString());
        return ResponseEntity.ok(new BaseResponse<>(myInfoDto));
    }

    @PostMapping("/logout")
    public ResponseEntity<BaseResponse<String>> logout(
        @AuthenticationPrincipal AuthenticatedUser detail,
        @CookieValue(value = "REFRESH", required = false) String refresh,
        HttpServletResponse response) {

        Cookie refreshCookie = cookieUtil.createCookie("REFRESH", null);
        refreshCookie.setMaxAge(0);
        response.addCookie(refreshCookie);

        tokenService.deleteRefreshToken(refresh);
        log.info("로그아웃 성공! 사용자 정보: {}", detail.toString());
        return ResponseEntity.ok(new BaseResponse<>("Logout success!"));
    }

    @GetMapping("/public/reissue")
    public ResponseEntity<BaseResponse<Map<String, String>>> refreshSuccess(
        @CookieValue(value = "REFRESH", required = false) String refresh) {
        String accessToken = tokenService.reissueAccessToken(refresh);

        log.info("AccessToken 재발급 성공! AccessToken: {}", accessToken);

        // 토큰 헤더에 삽입
        //response.setHeader("Authorization", "Bearer " + accessToken);
        // ✅ Access Token을 JSON Body에 포함하여 반환
        Map<String, String> responseBody = new HashMap<>();
        responseBody.put("accessToken", accessToken);
        return ResponseEntity.ok(new BaseResponse<>(responseBody));
    }

    @PatchMapping("/nickname")
    public ResponseEntity<BaseResponse<String>> updateNickname(
        @AuthenticationPrincipal AuthenticatedUser detail, String nickname) {
        memberService.updateNickname(detail.getMemberId(), nickname);
        log.info("닉네임 변경 성공! 변경된 닉네임: {}", nickname);
        return ResponseEntity.ok(new BaseResponse<>("Nickname update success!"));
    }

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

    @GetMapping("/mycat")
    public ResponseEntity<BaseResponse<List<Cat>>> getMyCats(
        @AuthenticationPrincipal AuthenticatedUser detail) {
        List<Cat> cats = memberService.getCatIdsByMemberId(detail.getMemberId());
        log.info("사용자가 보유한 고양이 ID 목록: {}", cats);
        return ResponseEntity.ok(new BaseResponse<>(cats));
    }

    @GetMapping("/pick/cat")
    public ResponseEntity<BaseResponse<Cat>> pickCat(
        @AuthenticationPrincipal AuthenticatedUser detail) {
        Cat cat = memberService.pickCat(detail.getMemberId());
        log.info("{} 번 고양이를 뽑았습니다.", cat.getCatId());
        return ResponseEntity.ok(new BaseResponse<>(cat));
    }
}
