package com.backend_semi.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@NoArgsConstructor
public class MemberSignupRequestDto {

    private String loginId;
    private String password;
    private String name;
    private String email;
    private String phone;
    private LocalDate birthDate;

    private List<Long> profileIds;
}