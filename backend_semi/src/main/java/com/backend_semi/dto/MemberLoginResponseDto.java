package com.backend_semi.dto;

import com.backend_semi.constant.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MemberLoginResponseDto {
    private String accessToken;
    private Long memberId;
    private Role role;
    private String loginId;
    private String email;
    private String name;
    private String phone; // 사용자 이름을 프론트에 던져줄 용도

}
