package com.backend_semi.dto;

import com.backend_semi.entity.MemberLearningProfile;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class MemberUpdateRequestDto { // 확인
    // 회원정보를 수정하기 위한 정보를 받는 Dto
    private String email;
    private String phone;
    private LocalDate birthDate;
    private List<Long> learningProfile;

    // 선택적 OPTIONAL
    private String currentPassword;
    private String newPassword;
    private String newPasswordConfirm;
}
