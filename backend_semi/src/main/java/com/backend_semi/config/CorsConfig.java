package com.backend_semi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        /*
         * 프론트엔드 주소 허용
         *
         * EC2에서 프론트를 직접 IP로 열고 있으면:
         * http://EC2_PUBLIC_IP
         * http://EC2_PUBLIC_IP:5173
         *
         * 도메인을 쓰면:
         * http://도메인
         * https://도메인
         */
        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173",

                // EC2 프론트 접속 주소에 맞게 수정
                "http://*",
                "https://*"

                // 나중에 도메인 고정하면 위의 http://*, https://* 대신 아래처럼 좁히는 게 좋음
                // "http://너의도메인.com",
                // "https://너의도메인.com",
                // "https://*.너의도메인.com"
        ));

        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "X-Requested-With"
        ));

        configuration.setExposedHeaders(List.of(
                "Authorization"
        ));

        /*
         * JWT를 Authorization 헤더로 보내는 방식이면 true/false 둘 다 큰 문제는 없지만,
         * withCredentials를 쓰거나 쿠키 인증 가능성을 열어둔 상태면 true.
         *
         * 단, allowCredentials(true)일 때 allowedOrigins("*")는 불가.
         * 그래서 allowedOriginPatterns를 사용함.
         */
        configuration.setAllowCredentials(true);

        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}