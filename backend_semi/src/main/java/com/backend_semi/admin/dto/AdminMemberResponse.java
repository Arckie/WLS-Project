package com.backend_semi.admin.dto;

import com.backend_semi.constant.Role;
import com.backend_semi.entity.Member;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
public class AdminMemberResponse {

    private Long memberId;
    private Role role;
    private String loginId;
    private String email;
    private String name;
    private String phone;
    private LocalDate birthDate;
    private LocalDateTime createdAt;

    public AdminMemberResponse(Member member){
        this.memberId = member.getMemberId();
        this.role = member.getRole();
        this.loginId = member.getLoginId();
        this.email = member.getEmail();
        this.name = member.getName();
        this.phone = member.getPhone();
        this.birthDate = member.getBirthDate();
        this.createdAt = member.getCreatedAt();

    }





}