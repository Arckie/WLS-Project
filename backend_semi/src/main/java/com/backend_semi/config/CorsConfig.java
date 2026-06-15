package com.backend_semi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration // 설정 파일임을 의미
public class CorsConfig {
    // 객체임을 의미
    @Bean // Spring Security가 이 이름으로 된 Bean을 읽으면 자동으로 CORS 정책으로 사용함
    public CorsConfigurationSource corsConfigurationSource(){
        // configuration 객체는 클라이언트로부터 요청이 들어 왔을 때 CORS 정책을 적용시켜주는 객체
        // 구체적인 CORS 허용 기준(출처, 메서드, 헤더 등)을 조율하고 담아둘 설정 바구니 객체
        CorsConfiguration configuration = new CorsConfiguration();

        // 리액트의 포트 번호를 여기에 작성
        // 도메인 주소로 수정
        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://passwordless.arckie.xyz",
                "http://wls.arckie.xyz"
                // 나중에 도메인 주소 추가해야함
                // ex) "https://jesuisben.store" / "https://*.jesuisben.store"
        ));

        // 허용 HTTP 메소드
        // 조회(GET), 등록(POST), 수정(PUT, PATCH), 삭제(DELETE), 예비 요청(OPTIONS)
        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));

        // Authorization은 axiosInstance.tsx 파일 참조
        // Content-Type은 LoginPage.tsx 파일 참조
        // 프론트가 요청보낼때 헤더에 담아 보낼 키 값들을 허용
        configuration.setAllowedHeaders(List.of(
                "Authorization", // JWT 토큰을 담아 보낼 헤더
                "Content-Type", // MIME 타입 / JSON 형태로 보낼 때(application/json)
                "Accept" // 백엔드로부터 어떤 응답 데이터 포맷을 받기를 원하는지 명시할 때 쓰임
        ));

        // 쿠키 Authorization 헤더 포함 요청 허용
        // 프론트엔드에서 axios나 fetch를 쓸 때 인증 정보(withCredentials)를 실어 보내도
        // 서버가 거부하지 않고 정상 처리
        configuration.setAllowCredentials(true);

        // CorsConfigurationSource가 인터페이스여서 객체 생성 못함
        // 그래서 구현체를 만들어서 객체 생성함
        UrlBasedCorsConfigurationSource source
                = new UrlBasedCorsConfigurationSource();

        // 설정 객체인 configuration을 구현체로 생성한 객체인 source에 할당함
        // 모든 요청에 똑같이 위의 설정값들을 적용함 (**의 의미)
        // 만든 정책 바구니(configuration)를 어떤 URL 주소에 적용할지 연결(등록)하는 과정
        // 백엔드 서버로 들어오는 모든 경로의 모든 요청
        source.registerCorsConfiguration("/**", configuration);

        /* 어떤 요청에는 어떤 설정값을 적용할지 상세히 나눌 수도 있음
        source.registerCorsConfiguration("/member/**", memberConfig);
        source.registerCorsConfiguration("/product/**", productConfig);
        source.registerCorsConfiguration("/cart/**", cartConfig);
        */

        // 구현체를 리턴함 (모든 설정과 URL 매핑이 완료된 source 객체를 반환)
        // 반환된 객체가 스프링 컨테이너에 빈(Bean)으로 등록되어 CORS 설정으로 사용됨
        return source ;
    }
}