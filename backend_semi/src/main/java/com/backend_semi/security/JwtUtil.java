package com.backend_semi.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtil {

    private final PrivateKey privateKey;
    private final PublicKey publicKey;
    private final long expiration;

    public JwtUtil(
            // 배포할때 사용할 jwt키를 가져오기
            @Value("${jwt.private-key:}") String privateKeyContent,
            @Value("${jwt.public-key:}") String publicKeyContent,
            @Value("${jwt.private-key-path}") String privateKeyPath,
            @Value("${jwt.public-key-path}") String publicKeyPath,
            @Value("${jwt.expiration}") long expiration
    ) {
        try { // 키가 존재하면 키 사용, 키가 없으면 키의 경로로 키를 가져옴
            this.privateKey = loadPrivateKey(resolveKey(privateKeyContent, privateKeyPath));
            this.publicKey = loadPublicKey(resolveKey(publicKeyContent, publicKeyPath));
            this.expiration = expiration;
        } catch (Exception e) {
            throw new IllegalStateException("JWT 키 파일을 읽는 중 오류가 발생했습니다.", e);
        }
    }

    // 키가 있으면 키를 쓰고 키가 없으면 키의 경로를 가져와서 키를 가져오는 함수
    // 이 클래스의 맴버변수의 값을 어떤걸로 넣을지를 결정함
    // 내용이 있으면 그대로, 없으면 경로에서 파일을 읽어 내용 반환
    private String resolveKey(String content, String path) throws Exception {
        if (content != null && !content.isBlank()) {
            return content;
        }
        // 로컬의 경로에 있는 파일을 가져와서 그 내용을 string으로 만들어서 후 처리 안하게 함
        return Files.readString(Path.of(path));
    }

    // 토큰을 만드는 메서드. 회원번호와 아이디, 이름, 그리고 회원롤을 받아서 만든다.
    public String createAccessToken(Long memberId, String loginId, String name, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(String.valueOf(memberId))
                .claim("loginId", loginId)
                .claim("name", name)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(privateKey, Jwts.SIG.RS256) // RS256 알고리즘 사용
                .compact();
    }

    public String getRole(String token){
        Claims claims = parseToken(token);
        return claims.get("role", String.class);
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(publicKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long getMemberId(String token) {
        Claims claims = parseToken(token);
        return Long.valueOf(claims.getSubject());
    }

    public String getLoginId(String token) {
        Claims claims = parseToken(token);
        return claims.get("loginId", String.class);
    }

    public String getName(String token) {
        Claims claims = parseToken(token);
        return claims.get("name", String.class);
    }

    private PrivateKey loadPrivateKey(String privateKeyContent) throws Exception {
        String key = privateKeyContent
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");

        byte[] decodedKey = Base64.getDecoder().decode(key);
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(decodedKey);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePrivate(keySpec);
    }

    private PublicKey loadPublicKey(String publicKeyContent) throws Exception {
        System.out.println("현재 실행 위치 = " + System.getProperty("user.dir"));

        String key = publicKeyContent
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s", "");

        byte[] decodedKey = Base64.getDecoder().decode(key);
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(decodedKey);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePublic(keySpec);
    }
}