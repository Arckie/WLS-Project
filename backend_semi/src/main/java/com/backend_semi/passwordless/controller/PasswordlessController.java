package com.backend_semi.passwordless.controller;

import com.backend_semi.passwordless.dto.*;
import com.backend_semi.passwordless.service.PasswordlessService;
import com.backend_semi.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.UUID;


@RestController
@RequiredArgsConstructor
@RequestMapping("/passwordless")
public class PasswordlessController {

    private final PasswordlessService passwordlessService;
    private final MemberRepository memberRepository; // DB 회원 체크용

    // 가입여부
    @PostMapping("/is-ap")
    public PasswordlessApiResponse<IsApResponseDataDto> checkRegistration(@RequestBody IsApRequestDto request){
        return passwordlessService.isAp(request);
    }

    // 등록 정보 요청
    @PostMapping("/join-ap")
    public ResponseEntity<?> registrationRequest(@RequestBody JoinApRequestDto request) {
        // DB에 존재하는 아이디인지 먼저 확인
        if (!memberRepository.existsByLoginId(request.getUserId())) {
            return ResponseEntity.badRequest().body("존재하지 않는 아이디입니다.");
        }
        return ResponseEntity.ok(passwordlessService.JoinAp(request));
    }

    // 암호화된 일회용 토큰요청
    @PostMapping("/getTokenForOneTime")
    public PasswordlessApiResponse<GetTokenForOneTimeResponseDto> getTokenForOneTime(@RequestBody GetTokenForOneTimeRequestDto request){
        return passwordlessService.GetTokenForOneTime(request);
    }

    // 자동패스워드 생성 요청 -> 인증 요청
    @PostMapping("/getSp")
    public PasswordlessApiResponse<GetSpResponseDto> getSpRequest(@RequestBody GetSpRequestDto request){
        return passwordlessService.GetSp(request);
    }

    // 모바일 승인 여부 확인
    @PostMapping("/result")
    public PasswordlessApiResponse<ResultResponseDto> resultRequest(@RequestBody ResultRequestDto request){
        return passwordlessService.result(request);
    }

    // 인증 취소
    @PostMapping("/cancel")
    public CancelResponseDto cancelRequest(@RequestBody CancelRequestDto request){
        return passwordlessService.Cancel(request);
    }

    // 해지 요청
    @PostMapping("/withdrawalAp")
    public CancelResponseDto withdrawalApRequest(@RequestBody IsApRequestDto request){
        return passwordlessService.WithdrawalAp(request);
    }

    @PostMapping("/login-process")
    public ResponseEntity<?> loginProcess(@RequestBody IsApRequestDto request) {

        // 1. DB에 존재하는 아이디인지 먼저 확인
        if (!memberRepository.existsByLoginId(request.getUserId())) {
            return ResponseEntity.badRequest().body("존재하지 않는 아이디입니다.");
        }

        // 2. Passwordless 등록 여부 확인
        PasswordlessApiResponse<IsApResponseDataDto> isApResponse =
                passwordlessService.isAp(request);

        System.out.println("isExist: " + isApResponse.getData().isExist());

        if (!isApResponse.getData().isExist()) {
            return ResponseEntity.badRequest()
                    .body("Passwordless 미등록 사용자입니다. 먼저 앱을 등록해주세요.");
        }

        // 3. 토큰 요청
        GetTokenForOneTimeRequestDto tokenRequest = new GetTokenForOneTimeRequestDto();
        tokenRequest.setUserId(request.getUserId());
        PasswordlessApiResponse<GetTokenForOneTimeResponseDto> tokenResponse =
                passwordlessService.GetTokenForOneTime(tokenRequest);

        // 4. getSp 요청
        GetSpRequestDto spRequest = new GetSpRequestDto();
        spRequest.setUserId(request.getUserId());
        spRequest.setToken(tokenResponse.getData().getToken());
        spRequest.setRandom(UUID.randomUUID().toString());
        spRequest.setSessionId(UUID.randomUUID().toString());

        return ResponseEntity.ok(passwordlessService.GetSp(spRequest));
    }
}