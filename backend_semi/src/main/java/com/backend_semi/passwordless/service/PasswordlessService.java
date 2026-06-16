package com.backend_semi.passwordless.service;

import com.backend_semi.passwordless.client.PasswordlessWebClient;
import com.backend_semi.passwordless.config.PasswordlessProperties;
import com.backend_semi.passwordless.dto.*;
import com.backend_semi.passwordless.util.PasswordlessTokenDecryptor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PasswordlessService {

    private final PasswordlessWebClient passwordlessWebClient;
    private final PasswordlessTokenDecryptor tokenDecryptor;
    private final PasswordlessProperties properties;

    public PasswordlessApiResponse<IsApResponseDataDto> isAp(IsApRequestDto request) {
        validateUserId(request);
        return passwordlessWebClient.requestIsAp(request);
    }

    public PasswordlessApiResponse<JoinApResponseDataDto> joinAp(JoinApRequestDto request) {
        if (request == null || request.getUserId() == null || request.getUserId().isBlank()) {
            throw new IllegalArgumentException("userId는 필수 값입니다.");
        }

        return passwordlessWebClient.requestJoinAp(request);
    }

    public PasswordlessApiResponse<GetTokenForOneTimeResponseDto> getTokenForOneTime(
            GetTokenForOneTimeRequestDto request
    ) {
        if (request == null || request.getUserId() == null || request.getUserId().isBlank()) {
            throw new IllegalArgumentException("userId는 필수 값입니다.");
        }

        return passwordlessWebClient.requestGetTokenForOneTime(request);
    }

    public PasswordlessApiResponse<GetSpResponseDto> getSp(GetSpRequestDto request) {
        if (request == null || request.getToken() == null || request.getToken().isBlank()) {
            throw new IllegalArgumentException("토큰값(복호화됨)은 필수 값입니다.");
        }

        if (request.getUserId() == null || request.getUserId().isBlank()) {
            throw new IllegalArgumentException("userId는 필수 값입니다.");
        }

        if (request.getRandom() == null || request.getRandom().isBlank()) {
            throw new IllegalArgumentException("random 값은 필수 값입니다.");
        }

        if (request.getSessionId() == null || request.getSessionId().isBlank()) {
            throw new IllegalArgumentException("sessionId는 필수 값입니다.");
        }

        return passwordlessWebClient.requestGetSp(request);
    }

    /*
     * 로그인 승인 결과를 기다립니다.
     * auth 값 기준:
     * W = 대기
     * Y = 승인
     * N = 거절
     */
    public PasswordlessApiResponse<ResultResponseDto> result(ResultRequestDto request) {
        if (request == null || request.getUserId() == null || request.getUserId().isBlank()) {
            throw new IllegalArgumentException("userId는 필수 값입니다.");
        }

        if (request.getSessionId() == null || request.getSessionId().isBlank()) {
            throw new IllegalArgumentException("sessionId는 필수 값입니다.");
        }

        int maxTryCount = 180;

        for (int i = 0; i < maxTryCount; i++) {
            PasswordlessApiResponse<ResultResponseDto> response =
                    passwordlessWebClient.requestResult(request);

            if (response == null) {
                throw new IllegalStateException("Passwordless result 응답이 없습니다.");
            }

            ResultResponseDto data = response.getData();

            if (data != null) {
                String auth = data.getAuth();

                if ("Y".equals(auth)) {
                    return response;
                }

                if ("N".equals(auth)) {
                    return response;
                }

                if ("W".equals(auth)) {
                    sleepOneSecond();
                    continue;
                }
            }

            if ("200.6".equals(response.getCode())) {
                sleepOneSecond();
                continue;
            }

            return response;
        }

        throw new IllegalStateException("Passwordless 인증 대기 시간이 초과되었습니다.");
    }

    /*
     * 등록 완료를 기다립니다.
     * joinAp로 QR을 발급한 뒤, 앱 등록이 완료되면 isAp의 data.exist가 true가 됩니다.
     */
    public PasswordlessApiResponse<IsApResponseDataDto> waitRegistration(IsApRequestDto request) {
        validateUserId(request);

        int maxTryCount = 180;

        for (int i = 0; i < maxTryCount; i++) {
            PasswordlessApiResponse<IsApResponseDataDto> response =
                    passwordlessWebClient.requestIsAp(request);

            if (response == null) {
                throw new IllegalStateException("Passwordless 등록 확인 응답이 없습니다.");
            }

            IsApResponseDataDto data = response.getData();

            if (data != null && data.isExist()) {
                return response;
            }

            sleepOneSecond();
        }

        throw new IllegalStateException("Passwordless 등록 대기 시간이 초과되었습니다.");
    }

    public CancelResponseDto cancel(CancelRequestDto request) {
        if (request == null || request.getUserId() == null || request.getUserId().isBlank()) {
            throw new IllegalArgumentException("userId는 필수 값입니다.");
        }

        if (request.getSessionId() == null || request.getSessionId().isBlank()) {
            throw new IllegalArgumentException("sessionId는 필수 값입니다.");
        }

        return passwordlessWebClient.requestCancel(request);
    }

    public CancelResponseDto withdrawalAp(IsApRequestDto request) {
        validateUserId(request);
        return passwordlessWebClient.requestWithdrawal(request);
    }

    public PasswordlessApiResponse<GetTokenForOneTimeResponseDto> getTokenForOneTimeDecrypt(
            GetTokenForOneTimeRequestDto request
    ) {
        if (request == null || request.getUserId() == null || request.getUserId().isBlank()) {
            throw new IllegalArgumentException("userId는 필수 값입니다.");
        }

        PasswordlessApiResponse<GetTokenForOneTimeResponseDto> response =
                passwordlessWebClient.requestGetTokenForOneTime(request);

        if (response == null || response.getData() == null || response.getData().getToken() == null) {
            throw new IllegalStateException("Passwordless token 응답이 비어 있습니다.");
        }

        String encryptedToken = response.getData().getToken();
        String serverKey = properties.getServerKey();

        String decryptedToken = tokenDecryptor.decryptToken(encryptedToken, serverKey);

        System.out.println("복호화된 token = " + decryptedToken);

        response.getData().setToken(decryptedToken);

        return response;
    }

    private void validateUserId(IsApRequestDto request) {
        if (request == null || request.getUserId() == null || request.getUserId().isBlank()) {
            throw new IllegalArgumentException("userId는 필수 값입니다.");
        }
    }

    private void sleepOneSecond() {
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Passwordless 인증 대기 중 인터럽트 발생", e);
        }
    }
}