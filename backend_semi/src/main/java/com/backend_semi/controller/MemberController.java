package com.backend_semi.controller;

import com.backend_semi.dto.*;
import com.backend_semi.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @PostMapping("/signup")
    public ResponseEntity<Long> signup(
            @RequestBody MemberSignupRequestDto request
    ) {
        Long memberId = memberService.signup(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(memberId);
    }

    @PostMapping("/login")
    public ResponseEntity<MemberLoginResponseDto> login(
            @RequestBody MemberLoginRequestDto request
    ) {
        MemberLoginResponseDto response = memberService.login(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/mypage")
    public ResponseEntity<MemberInfoResponseDto> getMyInfo() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        Long memberId = (Long) authentication.getPrincipal();

        MemberInfoResponseDto response = memberService.getMyInfo(memberId);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/mypage")
    public ResponseEntity<Void> updateMyInfo(
            Authentication authentication,
            @RequestBody MemberUpdateRequestDto request
    ) {
        String loginId = (String) authentication.getDetails();

        memberService.updateMemberInfo(loginId, request);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/checkId")
    public ResponseEntity<Boolean> checkLoginIdDuplicate(
            @RequestParam String loginId
    ) {
        boolean isDuplicate = memberService.checkLoginDuplicate(loginId);

        return ResponseEntity.ok(isDuplicate);
    }

    @PatchMapping("/mypage/password")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @RequestBody MemberPasswordChangeRequestDto request
    ) {
        String loginId = (String) authentication.getDetails();

        memberService.changePassword(loginId, request);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/signoff")
    public ResponseEntity<Void> deleteMember(
            Authentication authentication
    ) {
        String loginId = (String) authentication.getDetails();

        memberService.deleteMember(loginId);

        return ResponseEntity.ok().build();
    }
}