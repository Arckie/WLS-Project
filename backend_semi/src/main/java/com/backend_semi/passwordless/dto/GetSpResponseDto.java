package com.backend_semi.passwordless.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GetSpResponseDto {
    private int term; // 초단위. 인증 유효 시간
    private String pushConnectorUrl; // 푸시서버 URL
    private String pushConnectorToken; // 푸시서버 연결 토큰
    private String servicePassword; // 자동 패스워드
    private String userId; // 사용자ID -> 프론트에 보낼떄는 loginId로 처리해야 알아먹음
}