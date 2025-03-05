package com.finbattle.domain.login.controller;

import com.finbattle.domain.login.dto.AuthenticatedUser;
import com.finbattle.domain.login.service.LoginService;
import com.finbattle.domain.member.entity.Member;
import com.finbattle.domain.member.service.MemberService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/")
@RequiredArgsConstructor
public class LoginController {
    private final LoginService loginService;
    private final MemberService memberService;

    @GetMapping("/login/success")
    public String loginSuccess(
        @AuthenticationPrincipal AuthenticatedUser detail) {
        Member member = memberService.getMemberInfo(detail.getMemberId());
        //loginService.setTokens(detail, response);
        log.info("로그인 성공! 사용자 정보: {}", member.toString());
        return "로그인 성공!";
    }

    @PostMapping("/logout")
    public String logout(
        @AuthenticationPrincipal AuthenticatedUser detail,
        HttpServletResponse response) {
        loginService.logout(detail, response);
        return "로그아웃 성공!";
    }
}
