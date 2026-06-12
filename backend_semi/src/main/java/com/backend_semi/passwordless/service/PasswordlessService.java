package com.backend_semi.passwordless.service;

import com.backend_semi.passwordless.client.PasswordlessWebClient;
import com.backend_semi.passwordless.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PasswordlessService {
    private final PasswordlessWebClient passwordlessWebClient;

    public PasswordlessApiResponse<IsApResponseDataDto> isAp(IsApRequestDto request){
        if(request == null || request.getUserId() == null || request.getUserId().isBlank()){
            throw new IllegalArgumentException("loginId는 필수 값입니다.");
        }
        return passwordlessWebClient.requestIsAp(request);
    }

    public PasswordlessApiResponse<JoinApResponseDataDto> JoinAp(JoinApRequestDto request){
        if(request == null || request.getUserId() == null || request.getUserId().isBlank()){
            throw new IllegalArgumentException("loginId는 필수 값입니다.");
        }
        return passwordlessWebClient.requestJoinAp(request);
    }

    public PasswordlessApiResponse<GetTokenForOneTimeResponseDto> GetTokenForOneTime(GetTokenForOneTimeRequestDto request){
        if(request == null || request.getUserId() == null || request.getUserId().isBlank()){
            throw new IllegalArgumentException("loginId는 필수 값입니다.");
        }
        return passwordlessWebClient.requestGetTokenForOneTime(request);
    }

    // GetSp API를 실행하는 메서드.
    public PasswordlessApiResponse<GetSpResponseDto> GetSp(GetSpRequestDto request){
        if(request == null || request.getToken() == null || request.getToken().isBlank()){
            throw new IllegalArgumentException("토큰값(복호화됨)은 필수 값입니다.");
        }
        if(request.getUserId() == null || request.getUserId().isBlank()){
            throw new IllegalArgumentException("userId는 필수 값입니다.");
        }
        if(request.getRandom() == null || request.getRandom().isBlank()){
            throw new IllegalArgumentException("임의의 값은 필수 값입니다.");
        }
        if(request.getSessionId() == null || request.getSessionId().isBlank()){
            throw new IllegalArgumentException("세션ID는 필수 값입니다.");
        }
        return passwordlessWebClient.requestGetSp(request);
    }

    // Result를 60초 동안 기다립니다.
    // 인증결과를 모바일로 부터 확인하고 기다리는 절차.
    public PasswordlessApiResponse<ResultResponseDto> result(ResultRequestDto request){
        int maxTryCount = 60;

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
                    return response; // 승인
                }

                if ("N".equals(auth)) {
                    return response; // 반려
                }

                if ("W".equals(auth)) {
                    sleepOneSecond();
                    continue; // 대기중이면 다시 조회
                }
            }

            // data가 없거나 auth가 없는데 code가 대기중인 경우도 대비
            if ("200.6".equals(response.getCode())) {
                sleepOneSecond();
                continue;
            }

            return response;
        }

        throw new IllegalStateException("Passwordless 인증 대기 시간이 초과되었습니다.");
    }

    private void sleepOneSecond() {
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Passwordless 인증 대기 중 인터럽트 발생", e);
        }
    }

    // 인증 취소
    public CancelResponseDto Cancel(CancelRequestDto request){
        if(request == null || request.getUserId() == null || request.getUserId().isBlank()){
            throw new IllegalArgumentException("토큰값(복호화됨)은 필수 값입니다.");
        }
        if(request.getSessionId() == null || request.getSessionId().isBlank()){
            throw new IllegalArgumentException("userId는 필수 값입니다.");
        }
        return passwordlessWebClient.requestCancel(request);
    }
    //withdrawalAp (해지요청)
    // IsApRequestDto를 사용해서 보냅니다. (userId만 필요함)
    // CancelResponseDto를 사용해서 바습니다. (공통적으로 필요한게 같음)
    public CancelResponseDto WithdrawalAp(IsApRequestDto request){
        if(request == null || request.getUserId() == null || request.getUserId().isBlank()){
            throw new IllegalArgumentException("userId는 필수 값입니다.");
        }
        return passwordlessWebClient.requestWithdrawal(request);
    }
}
