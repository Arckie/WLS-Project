package com.backend_semi.passwordless.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GetTokenForOneTimeResponseDto {
    private String token;
}