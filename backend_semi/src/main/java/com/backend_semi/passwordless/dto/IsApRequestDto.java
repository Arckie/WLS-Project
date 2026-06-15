package com.backend_semi.passwordless.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IsApRequestDto {
    //withdrawalAp와 함께 사용합니다.
    private String userId;
    private String serverKey;
}