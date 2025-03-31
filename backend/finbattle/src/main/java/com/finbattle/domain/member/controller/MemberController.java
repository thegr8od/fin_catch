package com.finbattle.domain.member.controller;

import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.domain.member.dto.CatDto;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
public class MemberController implements MemberApi {

    private final MemberService memberService;
    private final TokenService tokenService;
    private final CookieUtil cookieUtil;

    @Override
    public ResponseEntity<BaseResponse<MyInfoDto>> login(AuthenticatedUser detail) {
        MyInfoDto myInfoDto = memberService.getMyInfo(detail.getMemberId());
        return ResponseEntity.ok(new BaseResponse<>(myInfoDto));
    }

    @Override
    public ResponseEntity<BaseResponse<String>> logout(
        AuthenticatedUser detail,
        String refresh,
        HttpServletResponse response
    ) {
        Cookie refreshCookie = cookieUtil.createCookie("REFRESH", null);
        refreshCookie.setMaxAge(0);
        response.addCookie(refreshCookie);

        tokenService.deleteRefreshToken(detail.getMemberId());
        log.info("{} 맴버 리프레시 토큰 삭제 후 로그아웃 성공!", detail.getMemberId());
        return ResponseEntity.ok(new BaseResponse<>("Logout success!"));
    }

    @Override
    public ResponseEntity<BaseResponse<Map<String, String>>> refreshSuccess(
        String refresh,
        HttpServletResponse response
    ) {
        String accessToken = tokenService.reissueAccessToken(refresh);
        log.info("AccessToken 재발급 성공! AccessToken: {}", accessToken);

        // 새 Access Token 헤더 세팅
        response.setHeader("Authorization", "Bearer " + accessToken);

        // Body 반환
        Map<String, String> responseBody = new HashMap<>();
        responseBody.put("accessToken", accessToken);
        return ResponseEntity.ok(new BaseResponse<>(responseBody));
    }

    @Override
    public ResponseEntity<BaseResponse<Cat>> updateMainCat(
        AuthenticatedUser detail,
        Long catId
    ) {
        Cat cat = memberService.updateMainCat(detail.getMemberId(), catId);
        log.info("대표 고양이 변경 성공!, 변경된 고양이: {}", cat);
        return ResponseEntity.ok(new BaseResponse<>(cat));
    }

    @Override
    public ResponseEntity<BaseResponse<String>> updateNickname(
        AuthenticatedUser detail,
        String nickname
    ) {
        memberService.updateNickname(detail.getMemberId(), nickname);
        log.info("닉네임 변경 성공! 변경된 닉네임: {}", nickname);
        return ResponseEntity.ok(new BaseResponse<>("Nickname update success!"));
    }

    @Override
    public ResponseEntity<BaseResponse<Boolean>> getNickname(String nickname) {
        boolean exists = memberService.findByNickname(nickname);
        if (exists) {
            log.info("{} 닉네임은 이미 존재합니다.", nickname);
        } else {
            log.info("{} 닉네임은 사용 가능합니다.", nickname);
        }
        return ResponseEntity.ok(new BaseResponse<>(exists));
    }

    @Override
    public ResponseEntity<BaseResponse<List<Cat>>> getMyCats(AuthenticatedUser detail) {
        List<Cat> cats = memberService.getCatIdsByMemberId(detail.getMemberId());
        log.info("사용자가 보유한 고양이 목록: {}", cats);
        return ResponseEntity.ok(new BaseResponse<>(cats));
    }

    @Override
    public ResponseEntity<BaseResponse<List<CatDto>>> pickCat(
        AuthenticatedUser detail,
        Integer count
    ) {
        List<CatDto> cats = memberService.pickCat(detail.getMemberId(), count);
        return ResponseEntity.ok(new BaseResponse<>(cats));
    }
}
