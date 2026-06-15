package com.backend_semi.admin.controller;

import com.backend_semi.admin.dto.AdminMemberResponse;
import com.backend_semi.admin.dto.AdminStatusResponse;
import com.backend_semi.admin.dto.RoleUpdateRequest;
import com.backend_semi.admin.service.AdminMemberService;
import com.backend_semi.constant.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminMemberController {

    private final AdminMemberService adminMemberService;

   // 관리자 통계 조회
    @GetMapping
    public AdminStatusResponse getAdminStatus(){
        return adminMemberService.getAdminStatus();

    }

    //관리자 회원 목록 조회
    @GetMapping("/members")
    public Page<AdminMemberResponse> getMembers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Role role

    ) {
        return adminMemberService.getMembers(page, size, keyword, role);
    }



    // 관리자 회원 권한 변경
    @PutMapping("/members/{memberId}/role")
    public ResponseEntity<Void> changeMemberRole(@PathVariable Long memberId,
                                 @RequestBody RoleUpdateRequest request) {
        adminMemberService.changeMemberRole(memberId, request.getRole());

        return ResponseEntity.ok().build();

    }


    //관리자 회원 삭제
    @DeleteMapping("/members/{memberId}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long memberId){
        adminMemberService.deleteMember(memberId);

        return ResponseEntity.ok().build();

    }


}