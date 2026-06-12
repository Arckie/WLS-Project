package com.backend_semi.passwordless.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JoinApRequestDto {
    private String userId;
    private String name;
    private String email;
}
