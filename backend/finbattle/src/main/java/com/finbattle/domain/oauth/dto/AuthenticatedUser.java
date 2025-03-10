package com.finbattle.domain.oauth.dto;

import com.finbattle.domain.member.dto.MemberDto;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

@RequiredArgsConstructor
public class AuthenticatedUser implements OAuth2User {

    private final MemberDto memberDto;

    @Override
    public Map<String, Object> getAttributes() {
        return null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Collection<GrantedAuthority> collection = new ArrayList<>();
        collection.add(() -> "ROLE_USER");
        return collection;
    }

    @Override
    public String getName() {
        return memberDto.getMemberId().toString();
    }

    public String getProviderId() {
        return memberDto.getProviderId();
    }

    public Long getMemberId() {
        return memberDto.getMemberId();
    }
}
