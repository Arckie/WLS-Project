package com.backend_semi.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class MemberPasswordChangeRequestDto {
    private String currentPassword;
    private String newPassword;
    private String newPasswordConfirm;
}
