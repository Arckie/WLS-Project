package com.backend_semi.passwordless.controller;

import com.backend_semi.dto.MemberLoginResponseDto;
import com.backend_semi.passwordless.config.PasswordlessProperties;
import com.backend_semi.passwordless.dto.*;
import com.backend_semi.passwordless.service.PasswordlessService;
import com.backend_semi.repository.MemberRepository;
import com.backend_semi.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
        if (request.getUserId() == null || request.getUserId().isBlank()) {
            return ResponseEntity.badRequest().body("아이디를 입력해 주세요.");
        }

        if (!memberRepository.existsByLoginId(request.getUserId())) {
            return ResponseEntity.badRequest().body("존재하지 않는 아이디입니다.");
        }

        request.setServerKey(passwordlessProperties.getServerKey());

        return ResponseEntity.ok(passwordlessService.joinAp(request));
    }

    /*
     * Passwordless 앱 등록 완료를 기다리는 API입니다.
     * 프론트는 join-ap로 QR을 받은 뒤 이 API를 한 번 호출합니다.
     * 백엔드는 내부에서 isAp를 반복 조회하다가 exist == true가 되면 응답합니다.
     */
    @PostMapping("/registration-result")
    public ResponseEntity<?> registrationResult(
            @RequestBody IsApRequestDto request
    ) {
        if (request.getUserId() == null || request.getUserId().isBlank()) {
            return ResponseEntity.badRequest().body("아이디가 없습니다.");
        }

        if (!memberRepository.existsByLoginId(request.getUserId())) {
            return ResponseEntity.badRequest().body("존재하지 않는 아이디입니다.");
        }

        request.setServerKey(passwordlessProperties.getServerKey());

        PasswordlessApiResponse<IsApResponseDataDto> response =
                passwordlessService.waitRegistration(request);

        return ResponseEntity.ok(response);
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
                passwordlessService.getTokenForOneTimeDecrypt(tokenRequest);

        if (tokenResponse.getData() == null || tokenResponse.getData().getToken() == null) {
            return ResponseEntity.internalServerError()
                    .body("Passwordless token 응답이 비어 있습니다.");
        }

        GetSpRequestDto spRequest = new GetSpRequestDto();
        spRequest.setUserId(request.getUserId());
        spRequest.setToken(tokenResponse.getData().getToken());

        /*
         * 중요:
         * 프론트가 생성해서 보낸 random/sessionId를 그대로 사용합니다.
         * result 조회 때 같은 sessionId를 써야 합니다.
         */
        spRequest.setRandom(request.getRandom());
        spRequest.setSessionId(request.getSessionId());

        spRequest.setServerKey(passwordlessProperties.getServerKey());

        return ResponseEntity.ok(passwordlessService.getSp(spRequest));
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

        /*
         * 승인 완료면 여기서 우리 서비스 JWT를 발급합니다.
         * 프론트가 result:true 같은 값을 보내서 로그인 성공 처리하는 구조가 아닙니다.
         */
        if (data != null && "Y".equals(data.getAuth())) {
            MemberLoginResponseDto loginResponse =
                    memberService.passwordlessLogin(request.getUserId());

            return ResponseEntity.ok(loginResponse);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/cancel")
    public CancelResponseDto cancelRequest(
            @RequestBody CancelRequestDto request
    ) {
        request.setServerKey(passwordlessProperties.getServerKey());
        return passwordlessService.cancel(request);
    }

    @PostMapping("/withdrawalAp")
    public CancelResponseDto withdrawalApRequest(
            @RequestBody IsApRequestDto request
    ) {
        request.setServerKey(passwordlessProperties.getServerKey());
        return passwordlessService.withdrawalAp(request);
    }

    // 사용자가 멤버 페이지에서 해지를 시도하는 컨트롤러입니다.
    @PostMapping("/my-withdrawal")
    public ResponseEntity<?> withdrawalMyPasswordless(Authentication authentication) {
        if (authentication == null || authentication.getDetails() == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        String loginId = (String) authentication.getDetails();

        IsApRequestDto isApRequest = new IsApRequestDto();
        isApRequest.setUserId(loginId);
        isApRequest.setServerKey(passwordlessProperties.getServerKey());

        PasswordlessApiResponse<IsApResponseDataDto> isApResponse =
                passwordlessService.isAp(isApRequest);

        if (
                isApResponse == null ||
                        isApResponse.getData() == null ||
                        !isApResponse.getData().isExist()
        ) {
            return ResponseEntity.badRequest()
                    .body("Passwordless 설정된 사용자가 아닙니다.");
        }

        IsApRequestDto withdrawalRequest = new IsApRequestDto();
        withdrawalRequest.setUserId(loginId);
        withdrawalRequest.setServerKey(passwordlessProperties.getServerKey());

        CancelResponseDto withdrawalResponse =
                passwordlessService.withdrawalAp(withdrawalRequest);

        return ResponseEntity.ok(withdrawalResponse);
    }
}