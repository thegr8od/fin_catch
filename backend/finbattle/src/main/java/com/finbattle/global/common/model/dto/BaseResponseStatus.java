package com.finbattle.global.common.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum BaseResponseStatus {
    SUCCESS(true, HttpStatus.OK, 200, "요청에 성공하였습니다."),
    AUTHORIZATION_SUCCESS(true, HttpStatus.OK, 200, "토큰 발급에 성공하였습니다."),
    BAD_REQUEST(false, HttpStatus.BAD_REQUEST, 400, "입력값을 확인해주세요."),
    UNAUTHORIZED(false, HttpStatus.UNAUTHORIZED, 401, "인증이 필요합니다."),
    FORBIDDEN(false, HttpStatus.FORBIDDEN, 403, "권한이 없습니다."),
    NOT_FOUND(false, HttpStatus.NOT_FOUND, 404, "대상을 찾을 수 없습니다."),

    // JWT (1001 ~ 1099)
    JWT_NOT_FOUND(false, HttpStatus.UNAUTHORIZED, 1001, "JWT를 찾을 수 없습니다."),
    JWT_EXPIRED(false, HttpStatus.UNAUTHORIZED, 1002, "만료된 JWT입니다."),
    JWT_INVALID(false, HttpStatus.UNAUTHORIZED, 1003, "유효하지 않은 JWT입니다."),
    REFRESH_TOKEN_INVALID(false, HttpStatus.UNAUTHORIZED, 1004, "유효하지 않은 Refresh Token입니다."),
    REFRESH_TOKEN_NOT_FOUND(false, HttpStatus.UNAUTHORIZED, 1005, "Refresh Token이 없습니다."),

    // Member+Cat (2001 ~ 2099)
    MEMBER_NOT_FOUND(false, HttpStatus.NOT_FOUND, 2001, "맴버를 찾을 수 없습니다."),
    MEMBER_IS_DELETED(false, HttpStatus.BAD_REQUEST, 2002, "삭제된 회원 입니다."),
    CAT_NOT_FOUND(false, HttpStatus.NOT_FOUND, 2003, "고양이가 도망갔습니다."),
    POINT_NOT_ENOUGH(false, HttpStatus.BAD_REQUEST, 2004, "포인트가 부족합니다."),
    CAT_ALL_GONE(false, HttpStatus.NOT_FOUND, 2005, "고양이가 모두 도망갔습니다."),
    NOT_HAVE_CAT(false, HttpStatus.BAD_REQUEST, 2006, "해당 고양이를 아직 길들이지 못했습니다."),
    CAT_MAIN_ALREADY(false, HttpStatus.BAD_REQUEST, 2007, "이미 주인공인 고양이 입니다."),
    ;

    private final boolean isSuccess;
    @JsonIgnore
    private final HttpStatus httpStatus;
    private final int code;
    private final String message;

    BaseResponseStatus(boolean isSuccess, HttpStatus httpStatus, int code, String message) {
        this.isSuccess = isSuccess;
        this.httpStatus = httpStatus;
        this.code = code;
        this.message = message;
    }
}