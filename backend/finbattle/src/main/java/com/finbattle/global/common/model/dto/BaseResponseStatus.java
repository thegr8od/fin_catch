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

    // Banking (3001 ~ 3099)
    HEADER_INVALID(false, HttpStatus.BAD_REQUEST, 3000, "HEADER 정보가 유효하지 않습니다."),
    API_NAME_INVALID(false, HttpStatus.BAD_REQUEST, 3001, "API 이름이 유효하지 않습니다."),
    TRANSMISSION_DATE_INVALID(false, HttpStatus.BAD_REQUEST, 3002, "전송일자 형식이 유효하지 않습니다."),
    TRANSMISSION_TIME_INVALID(false, HttpStatus.BAD_REQUEST, 3003, "전송시각 형식이 유효하지 않습니다."),
    INSTITUTION_CODE_INVALID(false, HttpStatus.BAD_REQUEST, 3004, "기관코드가 유효하지 않습니다."),
    FINTECH_APP_NO_INVALID(false, HttpStatus.BAD_REQUEST, 3005, "핀테크 앱 일련번호가 유효하지 않습니다."),
    API_SERVICE_CODE_INVALID(false, HttpStatus.BAD_REQUEST, 3006, "API 서비스코드가 유효하지 않습니다."),
    INSTITUTION_TRANSACTION_NO_INVALID(false, HttpStatus.BAD_REQUEST, 3010, "기관거래고유번호가 유효하지 않습니다."),
    INSTITUTION_TRANSACTION_NO_DUPLICATE(false, HttpStatus.BAD_REQUEST, 3007,
        "기관거래고유번호가 중복된 값입니다."),
    API_KEY_INVALID(false, HttpStatus.BAD_REQUEST, 3008, "API_KEY가 유효하지 않습니다."),
    USER_KEY_INVALID(false, HttpStatus.BAD_REQUEST, 3009, "USER_KEY가 유효하지 않습니다.");

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