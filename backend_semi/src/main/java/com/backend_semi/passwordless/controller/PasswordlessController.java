package com.backend_semi.passwordless.controller;

import com.backend_semi.passwordless.config.PasswordlessProperties;
import com.backend_semi.passwordless.dto.*;
import com.backend_semi.passwordless.service.PasswordlessService;
import com.backend_semi.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/passwordless")
public class PasswordlessController {

    private final PasswordlessService passwordlessService;
    private final MemberRepository memberRepository; // DB 회원 체크용
    private final PasswordlessProperties passwordlessProperties;


    // 가입여부
    @PostMapping("/is-ap")
    public PasswordlessApiResponse<IsApResponseDataDto> checkRegistration(@RequestBody IsApRequestDto request){
        request.setServerKey(passwordlessProperties.getServerKey());
        return passwordlessService.isAp(request);
    }

    // 등록 정보 요청
    @PostMapping("/join-ap")
    public ResponseEntity<?> registrationRequest(@RequestBody JoinApRequestDto request) {
        // DB에 존재하는 아이디인지 먼저 확인
        if (!memberRepository.existsByLoginId(request.getUserId())) {
            return ResponseEntity.badRequest().body("존재하지 않는 아이디입니다.");
        }
        request.setServerKey(passwordlessProperties.getServerKey());
        return ResponseEntity.ok(passwordlessService.JoinAp(request));
    }

    // 암호화된 일회용 토큰요청
    @PostMapping("/getTokenForOneTime")
    public PasswordlessApiResponse<GetTokenForOneTimeResponseDto> getTokenForOneTime(@RequestBody GetTokenForOneTimeRequestDto request){
        request.setServerKey(passwordlessProperties.getServerKey());
        return passwordlessService.GetTokenForOneTime(request);
    }

    // 자동패스워드 생성 요청 -> 인증 요청
    @PostMapping("/getSp")
    public PasswordlessApiResponse<GetSpResponseDto> getSpRequest(@RequestBody GetSpRequestDto request){
        request.setServerKey(passwordlessProperties.getServerKey());
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
        request.setServerKey(passwordlessProperties.getServerKey());
        return passwordlessService.Cancel(request);
    }

    // 해지 요청
    @PostMapping("/withdrawalAp")
    public CancelResponseDto withdrawalApRequest(@RequestBody IsApRequestDto request){
        request.setServerKey(passwordlessProperties.getServerKey());
        return passwordlessService.WithdrawalAp(request);
    }

    @PostMapping("/login-process")
    public ResponseEntity<?> loginProcess(@RequestBody GetSpRequestDto request) {

        // 1. DB에 존재하는 아이디인지 먼저 확인
        if (!memberRepository.existsByLoginId(request.getUserId())) {
            return ResponseEntity.badRequest().body("존재하지 않는 아이디입니다.");
        }

        // 2. Passwordless 등록 여부 확인
        IsApRequestDto isApRequest = new IsApRequestDto();
        isApRequest.setUserId(request.getUserId());
        isApRequest.setServerKey(passwordlessProperties.getServerKey());

        PasswordlessApiResponse<IsApResponseDataDto> isApResponse =
                passwordlessService.isAp(isApRequest);

        System.out.println("isExist: " + isApResponse.getData().isExist());

        if (!isApResponse.getData().isExist()) {
            return ResponseEntity.badRequest()
                    .body("Passwordless 미등록 사용자입니다. 먼저 앱을 등록해주세요.");
        }

        // 3. 토큰 요청 + 복호화
        GetTokenForOneTimeRequestDto tokenRequest = new GetTokenForOneTimeRequestDto();
        tokenRequest.setUserId(request.getUserId());
        tokenRequest.setServerKey(passwordlessProperties.getServerKey());

        PasswordlessApiResponse<GetTokenForOneTimeResponseDto> tokenResponse =
                passwordlessService.GetTokenForOneTimeDecrypto(tokenRequest);

        // 4. getSp 요청
        GetSpRequestDto spRequest = new GetSpRequestDto();
        spRequest.setUserId(request.getUserId());
        spRequest.setToken(tokenResponse.getData().getToken());

        // 핵심: 프론트가 보낸 값을 그대로 사용
        spRequest.setRandom(request.getRandom());
        spRequest.setSessionId(request.getSessionId());

        spRequest.setServerKey(passwordlessProperties.getServerKey());

        return ResponseEntity.ok(passwordlessService.GetSp(spRequest));
    }
}