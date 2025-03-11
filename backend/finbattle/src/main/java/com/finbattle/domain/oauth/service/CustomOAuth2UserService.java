package com.finbattle.domain.oauth.service;

import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.domain.cat.repository.CatRepository;
import com.finbattle.domain.member.dto.AuthenticUser;
import com.finbattle.domain.member.model.Member;
import com.finbattle.domain.member.repository.MemberRepository;
import com.finbattle.domain.oauth.dto.AuthenticatedUser;
import com.finbattle.domain.oauth.dto.GoogleResponse;
import com.finbattle.domain.oauth.dto.KakaoResponse;
import com.finbattle.domain.oauth.dto.OAuth2Response;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final MemberRepository memberRepository;
    private final CatRepository catRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        //System.out.println(oAuth2User);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2Response oAuth2Response = null;
        if (registrationId.equals("google")) {
            oAuth2Response = new GoogleResponse(oAuth2User.getAttributes());
        } else if (registrationId.equals("kakao")) {
            oAuth2Response = new KakaoResponse(oAuth2User.getAttributes());
        } else {
            return null;
        }

        String providerId = oAuth2Response.getProvider() + "_" + oAuth2Response.getProviderId();
        Optional<Member> optionalMember = memberRepository.findByProviderId(providerId);
        Member member;
        if (optionalMember.isEmpty()) {
            String tempNickname = oAuth2Response.getName() + UUID.randomUUID();
            member = Member.of(providerId, tempNickname, oAuth2Response.getEmail());
            Cat dafaultCat = catRepository.findById(1L).orElse(new Cat());
            member.acquireCat(dafaultCat);
            memberRepository.save(member);
        } else {
            member = optionalMember.get();
        }

        return new AuthenticatedUser(AuthenticUser.from(member));
    }
}
