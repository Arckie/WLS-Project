package com.backend_semi.passwordless.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResultRequestDto {
    // 전부 Not Null
    private String userId;
    private String sessionId;
}