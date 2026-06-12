package com.backend_semi.passwordless.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JoinApResponseDataDto {
    // 등록정보 요청 joinAp의 DataDto
    private String qr; // 사용자 등록여부 확인
    private String corpId;
    private String registerKey;
    private String terms;// 등록정보 유효시간
    private String serverUrl;
    private String pushConnectorUrl;
    private String pushConnectorToken;
    private String userId;
}
