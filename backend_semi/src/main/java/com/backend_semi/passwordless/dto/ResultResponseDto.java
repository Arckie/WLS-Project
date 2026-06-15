package com.backend_semi.passwordless.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResultResponseDto {
    // 전부 Not Null
    private String auth;
    private String userId;
    private String hash;
}