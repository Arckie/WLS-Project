package com.backend_semi.passwordless.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
// withdrawalAp와 함께 사용합니다.
public class CancelRequestDto {
    private String userId;
    private String sessionId;
}