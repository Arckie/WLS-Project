package com.backend_semi.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@AllArgsConstructor
public class MemberInfoResponseDto {
    private String loginId;
    private String name;
    private String phone;
    private String email;
    private LocalDate birthDate;
    private List<String> memberLearningProfiles;
}
