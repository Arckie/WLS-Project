package com.backend_semi.passwordless.controller;

import com.backend_semi.dto.MemberLoginResponseDto;
import com.backend_semi.passwordless.config.PasswordlessProperties;
import com.backend_semi.passwordless.dto.*;
import com.backend_semi.passwordless.service.PasswordlessService;
import com.backend_semi.repository.MemberRepository;
import com.backend_semi.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/passwordless")
public class PasswordlessController {

    private final PasswordlessService passwordlessService;
    private final MemberRepository memberRepository;
    private final PasswordlessProperties passwordlessProperties;
    private final MemberService memberService;

    @PostMapping("/is-ap")
    public PasswordlessApiResponse<IsApResponseDataDto> checkRegistration(
            @RequestBody IsApRequestDto request
    ) {
        request.setServerKey(passwordlessProperties.getServerKey());
        return passwordlessService.isAp(request);
    }

    @PostMapping("/join-ap")
    public ResponseEntity<?> registrationRequest(
            @RequestBody JoinApRequestDto request
    ) {
        if (!memberRepository.existsByLoginId(request.getUserId())) {
            return ResponseEntity.badRequest().body("존재하지 않는 아이디입니다.");
        }

        request.setServerKey(passwordlessProperties.getServerKey());

        return ResponseEntity.ok(passwordlessService.JoinAp(request));
    }

    @PostMapping("/login-process")
    public ResponseEntity<?> loginProcess(
            @RequestBody GetSpRequestDto request
    ) {
        if (request.getUserId() == null || request.getUserId().isBlank()) {
            return ResponseEntity.badRequest().body("아이디를 입력해 주세요.");
        }

        if (request.getRandom() == null || request.getRandom().isBlank()) {
            return ResponseEntity.badRequest().body("random 값이 없습니다.");
        }

        if (request.getSessionId() == null || request.getSessionId().isBlank()) {
            return ResponseEntity.badRequest().body("sessionId 값이 없습니다.");
        }

        if (!memberRepository.existsByLoginId(request.getUserId())) {
            return ResponseEntity.badRequest().body("존재하지 않는 아이디입니다.");
        }

        IsApRequestDto isApRequest = new IsApRequestDto();
        isApRequest.setUserId(request.getUserId());
        isApRequest.setServerKey(passwordlessProperties.getServerKey());

        PasswordlessApiResponse<IsApResponseDataDto> isApResponse =
                passwordlessService.isAp(isApRequest);

        if (isApResponse.getData() == null || !isApResponse.getData().isExist()) {
            return ResponseEntity.badRequest()
                    .body("Passwordless 미등록 사용자입니다. 먼저 앱을 등록해주세요.");
        }

        GetTokenForOneTimeRequestDto tokenRequest = new GetTokenForOneTimeRequestDto();
        tokenRequest.setUserId(request.getUserId());
        tokenRequest.setServerKey(passwordlessProperties.getServerKey());

        PasswordlessApiResponse<GetTokenForOneTimeResponseDto> tokenResponse =
                passwordlessService.GetTokenForOneTimeDecrypto(tokenRequest);

        if (tokenResponse.getData() == null || tokenResponse.getData().getToken() == null) {
            return ResponseEntity.internalServerError()
                    .body("Passwordless token 응답이 비어 있습니다.");
        }

        GetSpRequestDto spRequest = new GetSpRequestDto();
        spRequest.setUserId(request.getUserId());
        spRequest.setToken(tokenResponse.getData().getToken());

        // 중요: 프론트가 보낸 random/sessionId를 그대로 사용
        spRequest.setRandom(request.getRandom());
        spRequest.setSessionId(request.getSessionId());

        spRequest.setServerKey(passwordlessProperties.getServerKey());

        return ResponseEntity.ok(passwordlessService.GetSp(spRequest));
    }

    @PostMapping("/result")
    public ResponseEntity<?> resultRequest(
            @RequestBody ResultRequestDto request
    ) {
        if (request.getUserId() == null || request.getUserId().isBlank()) {
            return ResponseEntity.badRequest().body("아이디가 없습니다.");
        }

        if (request.getSessionId() == null || request.getSessionId().isBlank()) {
            return ResponseEntity.badRequest().body("sessionId가 없습니다.");
        }

        PasswordlessApiResponse<ResultResponseDto> result =
                passwordlessService.result(request);

        ResultResponseDto data = result.getData();

        // 승인 완료면 여기서 바로 JWT 발급
        if (data != null && "Y".equals(data.getAuth())) {
            MemberLoginResponseDto loginResponse =
                    memberService.passwordlessLogin(request.getUserId());

            return ResponseEntity.ok(loginResponse);
        }

        // 거절/대기/기타 상태는 원본 응답 반환
        return ResponseEntity.ok(result);
    }

    @PostMapping("/cancel")
    public CancelResponseDto cancelRequest(
            @RequestBody CancelRequestDto request
    ) {
        request.setServerKey(passwordlessProperties.getServerKey());
        return passwordlessService.Cancel(request);
    }

    @PostMapping("/withdrawalAp")
    public CancelResponseDto withdrawalApRequest(
            @RequestBody IsApRequestDto request
    ) {
        request.setServerKey(passwordlessProperties.getServerKey());
        return passwordlessService.WithdrawalAp(request);
    }
}