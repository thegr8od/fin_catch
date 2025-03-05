package com.finbattle.domain.member;

import com.finbattle.domain.login.dto.AuthenticatedUser;
import com.finbattle.domain.member.entity.Member;
import com.finbattle.domain.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/member")
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;

    @GetMapping("/get")
    public Member getMember(@AuthenticationPrincipal AuthenticatedUser details) {
        return memberService.getMemberInfo(details.getMemberId());
    }
}
