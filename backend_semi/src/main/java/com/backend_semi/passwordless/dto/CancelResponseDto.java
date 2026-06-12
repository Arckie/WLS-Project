package com.backend_semi.passwordless.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CancelResponseDto {
    private boolean result;
    private String msg;
    private String code;
}
