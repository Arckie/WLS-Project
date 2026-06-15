package com.backend_semi.passwordless.controller;

import com.backend_semi.passwordless.dto.*;
import com.backend_semi.passwordless.service.PasswordlessService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/passwordless")
public class PasswordlessController {

    private final PasswordlessService passwordlessService;

    // 가입여부
    @PostMapping("/is-ap")
    public PasswordlessApiResponse<IsApResponseDataDto> checkRegistration(@RequestBody IsApRequestDto request){
        return passwordlessService.isAp(request);
    }

    // 등록 정보 요청
    @PostMapping("/join-ap")
    public PasswordlessApiResponse<JoinApResponseDataDto> registrationRequest(@RequestBody JoinApRequestDto request){
        return passwordlessService.JoinAp(request);
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
}
