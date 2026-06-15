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
import org.springframework.security.core.Authentication;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/passwordless")
public class PasswordlessController {

    private final PasswordlessService passwordlessService;
    private final MemberRepository memberRepository;
    private final PasswordlessProperties passwordlessProperties;
    private final MemberService memberService;

    // 가입 여부 확인
    @PostMapping("/is-ap")
    public PasswordlessApiResponse<IsApResponseDataDto> checkRegistration(
            @RequestBody IsApRequestDto request
    ) {
        request.setServerKey(passwordlessProperties.getServerKey());
        return passwordlessService.isAp(request);
    }

    // 등록 정보 요청
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

    // 암호화된 일회용 토큰 요청
    @PostMapping("/getTokenForOneTime")
    public PasswordlessApiResponse<GetTokenForOneTimeResponseDto> getTokenForOneTime(
            @RequestBody GetTokenForOneTimeRequestDto request
    ) {
        request.setServerKey(passwordlessProperties.getServerKey());
        return passwordlessService.GetTokenForOneTime(request);
    }

    // 자동 패스워드 생성 요청
    @PostMapping("/getSp")
    public PasswordlessApiResponse<GetSpResponseDto> getSpRequest(
            @RequestBody GetSpRequestDto request
    ) {
        request.setServerKey(passwordlessProperties.getServerKey());
        return passwordlessService.GetSp(request);
    }

    /*
     * Passwordless 로그인 시작
     *
     * 프론트에서 userId, random, sessionId를 보내면:
     * 1. DB 회원 확인
     * 2. Passwordless 등록 여부 확인
     * 3. 일회용 token 요청
     * 4. token 복호화
     * 5. getSp 요청
     *
     * 중요:
     * random/sessionId는 프론트가 보낸 값을 그대로 써야 한다.
     * 여기서 새 UUID를 만들면 result 확인 때 sessionId가 안 맞는다.
     */
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
        spRequest.setRandom(request.getRandom());
        spRequest.setSessionId(request.getSessionId());
        spRequest.setServerKey(passwordlessProperties.getServerKey());

        return ResponseEntity.ok(passwordlessService.GetSp(spRequest));
    }

    /*
     * 모바일 승인 여부 확인
     *
     * auth == "Y"이면 여기서 바로 JWT를 발급해서 반환한다.
     * 따라서 프론트에서 /api/members/passwordless-login을 따로 호출하지 않는다.
     */
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

        if (data != null && "Y".equals(data.getAuth())) {
            MemberLoginResponseDto loginResponse =
                    memberService.passwordlessLogin(request.getUserId());

            return ResponseEntity.ok(loginResponse);
        }

        return ResponseEntity.ok(result);
    }

    // 인증 취소
    @PostMapping("/cancel")
    public CancelResponseDto cancelRequest(
            @RequestBody CancelRequestDto request
    ) {
        request.setServerKey(passwordlessProperties.getServerKey());
        return passwordlessService.Cancel(request);
    }

    // 해지 요청
    @PostMapping("/withdrawalAp")
    public CancelResponseDto withdrawalApRequest(
            @RequestBody IsApRequestDto request
    ) {
        request.setServerKey(passwordlessProperties.getServerKey());
        return passwordlessService.WithdrawalAp(request);
    }
    // 로그인한 회원의 Passwordless 해지
    @PostMapping("/my-withdrawal")
    public ResponseEntity<?> withdrawalMyPasswordless(Authentication authentication) {
        if (authentication == null || authentication.getDetails() == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        String loginId = (String) authentication.getDetails();

        IsApRequestDto request = new IsApRequestDto();
        request.setUserId(loginId);
        request.setServerKey(passwordlessProperties.getServerKey());

        return ResponseEntity.ok(passwordlessService.WithdrawalAp(request));
    }
}