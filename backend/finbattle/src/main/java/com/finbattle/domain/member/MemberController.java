package com.finbattle.domain.member;

import static org.springframework.boot.actuate.web.exchanges.Include.AUTHORIZATION_HEADER;

import com.finbattle.domain.oauth.dto.AuthenticatedUser;
import com.finbattle.domain.member.entity.Member;
import com.finbattle.domain.member.service.MemberService;
import com.finbattle.domain.token.service.TokenService;
import com.finbattle.global.common.Util.CookieUtil;
import com.finbattle.global.common.model.dto.BaseResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
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

    @GetMapping("/login")
    public ResponseEntity<BaseResponse<Member>> loginSuccess(
        @AuthenticationPrincipal AuthenticatedUser detail) {
        Member member = memberService.getMemberInfo(detail.getMemberId());
        // loginService.setTokens(detail, response);
        log.info("로그인 성공! 사용자 정보: {}", member.toString());
        return ResponseEntity.ok(new BaseResponse<>(member));
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

        return ResponseEntity.ok(new BaseResponse<>("Logout success!"));
    }

    @PostMapping("/reissue")
    public ResponseEntity<BaseResponse<String>> refreshSuccess(@CookieValue(value = "REFRESH", required = false) String refresh, HttpServletResponse response) {
        String accessToken = tokenService.reissueAccessToken(refresh);

        response.setHeader("Authorization", "Bearer " + accessToken);
        return ResponseEntity.ok(new BaseResponse<>("AccessToken Reissue success!"));
    }
}
