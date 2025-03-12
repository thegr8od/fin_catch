package com.finbattle.global.common.Util;

import jakarta.servlet.http.Cookie;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {

    public Cookie createCookie(String key, String value) {
        Cookie cookie = new Cookie(key, value);
        cookie.setMaxAge(24 * 60 * 60);
        //cookie.setSecure(true);  // https 사용시 true
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        return cookie;
    }
}
