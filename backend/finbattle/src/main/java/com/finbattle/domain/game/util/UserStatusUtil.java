package com.finbattle.domain.game.util;

import com.finbattle.domain.game.dto.UserStatus;

public class UserStatusUtil {

    // UserStatus를 "userId|correct" 형태의 문자열로 직렬화
    public static String serialize(UserStatus userStatus) {
        return userStatus.getUserId() + "|" + userStatus.isCorrect();
    }

    // 문자열을 UserStatus 객체로 역직렬화 ("userId|correct")
    public static UserStatus deserialize(String str) {
        String[] parts = str.split("\\|");
        UserStatus u = new UserStatus();
        u.setUserId(parts[0]);
        u.setCorrect(Boolean.parseBoolean(parts[1]));
        return u;
    }
}
