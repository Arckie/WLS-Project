package com.backend_semi.passwordless.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GetSpRequestDto {
    private String token; // 복호화된 일회용 토큰임! // Not Null
    private String userId; // 사용자 아이디 Not Null
    private String random; // 임의의 값. -> 생성해야듯? // Not Null
    private String serverKey;
    private String sessionId; // 세션ID // Not Null
    private String clientIp; // 사용자IP // Nullable
}