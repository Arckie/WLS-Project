package com.backend_semi.admin.controller;

import com.backend_semi.admin.dto.AdminMemberResponse;
import com.backend_semi.admin.service.AdminMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/members")
@RequiredArgsConstructor
public class AdminMemberController {

    private final AdminMemberService adminMemberService;


    //관리자 회원 목록 조회
    @GetMapping
    public ResponseEntity<List<AdminMemberResponse>> getMembers() {
        List<AdminMemberResponse> members = adminMemberService.getMembers();
        return ResponseEntity.ok(members);
    }

    //관리자 회원 탈퇴 처리
    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long memberId){
        adminMemberService.deleteMember(memberId);

        return ResponseEntity.ok().build();

    }

    // 관리자 권한 변경
    @PatchMapping("/{memberId}/role/admin")
    public ResponseEntity<Void> changeMemberRoleToAdmin(@PathVariable Long memberId){
        adminMemberService.changeMemberRoleToAdmin(memberId);

        return ResponseEntity.ok().build();
    }
}