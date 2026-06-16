package com.backend_semi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import com.backend_semi.security.JwtAuthenticationFilter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;
import lombok.RequiredArgsConstructor;

@Configuration // 설정용 파일 어노테이션
@RequiredArgsConstructor
public class SecurityConfig {

    // CorsConfig.java에 CorsConfigurationSource의 @Bean으로 객체 생성이 되어 있음
    // 리액트(5173 포트)의 접근을 허락해 줄 교차 출입 허가증 정보를 주입받음
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean // 비밀번호를 암호화하는 메소드 (BCrypt 방식)
    public PasswordEncoder passwordEncoder(){
        // PW를 암호화해서 DB에 추가하기 위함
        return new BCryptPasswordEncoder();
    }

    @Bean
    // SecurityFilterChain : 스프링 시큐리티의 보안 필터들이 순서대로 늘어선 체인(사슬) 그 자체를 의미하는 인터페이스
    // HttpSecurity : SecurityFilterChain의 필터를 조립하는 도구함
    // JwtAuthenticationFilter는 이미 @Component로 등록되어 있어서 new로 만들지 않고 파라미터로 주입받아 사용함
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) throws Exception{

        // 로그인 없이(누구나) 허용할 url 배열 (배열 생성 초기화 기법)
        // 비로그인 상태의 메인 화면(Home.tsx)과 회원가입 화면(SignupPage.tsx)에서 호출되는 주소들
        String[] permitUrls = {
                "/files/**",             // 업로드 파일 서빙
                "/images/**",             // 이미지 서빙
                "/api/members/signup",   // 회원가입
                "/api/members/login",    // 로그인
                "/api/members/checkId",  // 아이디 중복확인 (회원가입 도중 호출)
        };

        http
                // CorsConfig에 설정해놓은 corsConfigurationSource를 시큐리티에 명시적으로 연결함
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                // 사이트 간 요청 위조(CSRF) 방지 기능을 비활성화 시킴
                // JWT 방식은 세션 쿠키를 쓰지 않으므로 CSRF 보호가 필요 없음
                .csrf(csrf -> csrf.disable())
                // 세션(Session)이라는 메모리 카드를 절대 쓰지 않는 STATELESS(무상태) 방식을 채택
                // -> 세션말고 오직 토큰만 검사 (JWT 보안의 핵심 정책!)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                // 요청에 대한 권한 설정 (인가)
                // .authorizeHttpRequests(auth -> auth ...) : 어떤 주소로 들어오는 요청을 허용하거나 막을지 정하는 구역
                // 주의: requestMatchers는 위에서부터 먼저 매칭되므로, 구체적인 규칙을 먼저 적어야 함
                .authorizeHttpRequests(auth -> auth
                        // 1) 누구나 접근 가능한 주소들 (배열로 한번에)
                        .requestMatchers(permitUrls).permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/passwordless/is-ap").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/passwordless/join-ap").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/passwordless/login-process").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/passwordless/result").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/passwordless/cancel").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/passwordless/registration-result").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/passwordless/my-withdrawal").authenticated()

                        // 2) 로그인하면 누구나 볼 수 있는 공개 조회들
                        // 비로그인 메인 화면(Home.tsx)에서도 호출되므로 permitAll로 열어둠
                        // 원래 "/api/lecture/list" 이거는 회원들만 보여줘야하는데 Home.tsx에 사용중이여서 넣음
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/lecture/list").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/notices").permitAll()

                        // 3) 관리자(ADMIN)만 가능한 "강의" 등록/수정/삭제
                        // 강의 목록(GET /api/lecture/list)보다 먼저 써야 update/insert/delete가 먼저 걸림
                        .requestMatchers(HttpMethod.POST, "/api/lecture/insert").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/lecture/delete/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/lecture/update/**").hasRole("ADMIN")   // 수정폼에 보여줄 데이터 조회
                        .requestMatchers(HttpMethod.PUT, "/api/lecture/update/**").hasRole("ADMIN")


                        // 4) 관리자(ADMIN)만 가능한 "공지" 등록/수정/삭제
                        // 공지 조회(GET /api/notices)보다 먼저 써야 등록/수정/삭제가 먼저 걸림
                        .requestMatchers(HttpMethod.POST, "/api/notices").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/notices/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/notices/**").hasRole("ADMIN")

                        // 5) 관리자(ADMIN)만 가능한 "관리자 페이지"
                        .requestMatchers("/api/admin", "/api/admin/**").hasRole("ADMIN")

                        // 5) 그 외의 나머지 모든 요청은 반드시 로그인(authenticated)을 해야만 접근 가능
                        // (마이페이지, 즐겨찾기, 학습진도 등 Authentication을 쓰는 컨트롤러들)
                        .anyRequest().authenticated()
                )
                // 내가 만든 JWT 필터를 UsernamePasswordAuthenticationFilter 앞에 배치해서 토큰을 먼저 검사함
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        // 지금까지 http 도구함에 담은 모든 설정을 빌드해서 실제 동작하는 보안 필터 객체로 만들어 반환함
        return http.build();
    }
}