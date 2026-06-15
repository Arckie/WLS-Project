package com.backend_semi.controller;

import com.backend_semi.dto.*;
import com.backend_semi.service.MemberService;
import com.backend_semi.dto.MemberLoginRequestDto;
import com.backend_semi.dto.MemberLoginResponseDto;
import com.backend_semi.dto.MemberSignupRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.backend_semi.security.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<Long> signup(@RequestBody MemberSignupRequestDto request){
        Long memberId = memberService.signup(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(memberId);
    }

    @PostMapping("/login")
    public ResponseEntity<MemberLoginResponseDto> login(@RequestBody MemberLoginRequestDto request){
        MemberLoginResponseDto response = memberService.login(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/mypage")
    public ResponseEntity<MemberInfoResponseDto> getMyInfo(){
        Authentication authenticaton  = SecurityContextHolder.getContext().getAuthentication();

        Long memberId = (Long) authenticaton.getPrincipal();

        MemberInfoResponseDto response = memberService.getMyInfo(memberId);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/mypage")
    public ResponseEntity<Void> updateMyInfo(
            Authentication authentication,
            @RequestBody MemberUpdateRequestDto request
    ){
        String loginId = (String) authentication.getDetails();

        memberService.updateMemberInfo(loginId, request);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/checkId")
    public ResponseEntity<Boolean> checkLoginIdDuplicate(@RequestParam String loginId){
        boolean isDuplicate = memberService.checkLoginDuplicate(loginId);

        return ResponseEntity.ok(isDuplicate);
    }

    // 비밀번호를 변경하는 컨트롤러
    @PatchMapping("/mypage/password")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @RequestBody MemberPasswordChangeRequestDto request
    ){
        String loginId = (String) authentication.getDetails();
        memberService.changePassword(loginId, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/signoff")
    public ResponseEntity<Void> deleteMember(Authentication authentication) {
        String loginId = (String) authentication.getDetails();
        memberService.deleteMember(loginId);

        return ResponseEntity.ok().build();
    }

}
