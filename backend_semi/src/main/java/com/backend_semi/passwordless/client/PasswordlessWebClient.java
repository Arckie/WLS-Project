package com.backend_semi.passwordless.client;

import com.backend_semi.passwordless.config.PasswordlessProperties;
import com.backend_semi.passwordless.dto.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class PasswordlessWebClient {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public PasswordlessWebClient(
            PasswordlessProperties properties,
            ObjectMapper objectMapper
    ) {
        this.webClient = WebClient.builder()
                .baseUrl(properties.getAuthServerUrl())
//                .defaultHeader("serverId", properties.getServerId())      // 추가
//                .defaultHeader("serverKey", properties.getServerKey())
                .build();

        this.objectMapper = objectMapper;
    }

    public PasswordlessApiResponse<IsApResponseDataDto> requestIsAp(IsApRequestDto request) {
        String responseBody = webClient.post()
                .uri("/ap/rest/auth/isAp")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.ALL)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        if (responseBody == null || responseBody.isBlank()) {
            throw new IllegalStateException("Passwordless 서버 응답 Body가 비어 있습니다.");
        }

        try {
            return objectMapper.readValue(
                    responseBody,
                    new TypeReference<PasswordlessApiResponse<IsApResponseDataDto>>() {}
            );
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(
                    "Passwordless 서버 응답을 JSON으로 변환하지 못했습니다. 응답 내용: " + responseBody,
                    e
            );
        }
    }

    // 등록 요청 QR 수신
    public PasswordlessApiResponse<JoinApResponseDataDto> requestJoinAp(JoinApRequestDto request) {
        String responseBody = webClient.post()
                .uri("/ap/rest/auth/joinAp")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.ALL)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        if (responseBody == null || responseBody.isBlank()) {
            throw new IllegalStateException("Passwordless 서버 응답 Body가 비어 있습니다.");
        }

        try {
            return objectMapper.readValue(
                    responseBody,
                    new TypeReference<PasswordlessApiResponse<JoinApResponseDataDto>>() {}
            );
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(
                    "Passwordless 서버 응답을 JSON으로 변환하지 못했습니다. 응답 내용: " + responseBody,
                    e
            );
        }
    }

    public PasswordlessApiResponse<GetTokenForOneTimeResponseDto> requestGetTokenForOneTime(GetTokenForOneTimeRequestDto request) {
        String responseBody = webClient.post()
                .uri("/ap/rest/auth/getTokenForOneTime")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.ALL)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        if (responseBody == null || responseBody.isBlank()) {
            throw new IllegalStateException("Passwordless 서버 응답 Body가 비어 있습니다.");
        }

        try {
            return objectMapper.readValue(
                    responseBody,
                    new TypeReference<PasswordlessApiResponse<GetTokenForOneTimeResponseDto>>() {}
            );
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(
                    "Passwordless 서버 응답을 JSON으로 변환하지 못했습니다. 응답 내용: " + responseBody,
                    e
            );
        }
    }

    public PasswordlessApiResponse<GetSpResponseDto> requestGetSp(GetSpRequestDto request) {
        String responseBody = webClient.post()
                .uri("/ap/rest/auth/getSp")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.ALL)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        if (responseBody == null || responseBody.isBlank()) {
            throw new IllegalStateException("Passwordless 서버 응답 Body가 비어 있습니다.");
        }

        try {
            return objectMapper.readValue(
                    responseBody,
                    new TypeReference<PasswordlessApiResponse<GetSpResponseDto>>() {}
            );
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(
                    "Passwordless 서버 응답을 JSON으로 변환하지 못했습니다. 응답 내용: " + responseBody,
                    e
            );
        }
    }

    public PasswordlessApiResponse<ResultResponseDto> requestResult(ResultRequestDto request) {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("userId", request.getUserId());
        formData.add("sessionId", request.getSessionId());

        String responseBody = webClient.post()
                .uri("/ap/rest/auth/result")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .accept(MediaType.ALL)
                .bodyValue(formData)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        if (responseBody == null || responseBody.isBlank()) {
            throw new IllegalStateException("Passwordless result 응답 Body가 비어 있습니다.");
        }

        try {
            return objectMapper.readValue(
                    responseBody,
                    new TypeReference<PasswordlessApiResponse<ResultResponseDto>>() {}
            );
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Passwordless result 응답 변환 실패: " + responseBody, e);
        }
    }

    // 인증 취소를 하는 API와 소통합니다.
    public CancelResponseDto requestCancel(CancelRequestDto request) {
        String responseBody = webClient.post()
                .uri("/ap/rest/auth/cancel")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.ALL)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        if (responseBody == null || responseBody.isBlank()) {
            throw new IllegalStateException("Passwordless 서버 응답 Body가 비어 있습니다.");
        }

        try {
            return objectMapper.readValue(
                    responseBody,
                    new TypeReference<CancelResponseDto>() {}
            );
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(
                    "Passwordless 서버 응답을 JSON으로 변환하지 못했습니다. 응답 내용: " + responseBody,
                    e
            );
        }
    }

    // 해지요청을 하는 API와 소통합니다.
    // 요청 DTO는 IsApRequestDto이고
    // 받는 DTO는 CancelResponseDto 입니다.
    public CancelResponseDto requestWithdrawal(IsApRequestDto request) {
        String responseBody = webClient.post()
                .uri("/ap/rest/auth/withdrawalAp")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.ALL)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        if (responseBody == null || responseBody.isBlank()) {
            throw new IllegalStateException("Passwordless 서버 응답 Body가 비어 있습니다.");
        }

        try {
            return objectMapper.readValue(
                    responseBody,
                    new TypeReference<CancelResponseDto>() {}
            );
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(
                    "Passwordless 서버 응답을 JSON으로 변환하지 못했습니다. 응답 내용: " + responseBody,
                    e
            );
        }
    }
}