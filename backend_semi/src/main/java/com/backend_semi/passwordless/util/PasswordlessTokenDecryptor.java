package com.backend_semi.passwordless.util;

import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class PasswordlessTokenDecryptor {

    public String decryptToken(String encryptedToken, String serverKey) {
        try {
            if (encryptedToken == null || encryptedToken.isBlank()) {
                throw new IllegalArgumentException("encryptedToken이 비어 있습니다.");
            }

            if (serverKey == null || serverKey.isBlank()) {
                throw new IllegalArgumentException("serverKey가 비어 있습니다.");
            }

            byte[] keyBytes = keyToBytes(serverKey);

            // 스펙: key == iv
            IvParameterSpec ivSpec = new IvParameterSpec(keyBytes);
            SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");

            byte[] encryptedBytes = base64ToBytes(encryptedToken);

            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, keySpec, ivSpec);

            byte[] decryptedBytes = cipher.doFinal(encryptedBytes);

            return new String(decryptedBytes, StandardCharsets.UTF_8);

        } catch (Exception e) {
            throw new IllegalStateException("Passwordless token 복호화 실패", e);
        }
    }

    private byte[] keyToBytes(String serverKey) {
        // 32자리 HEX 문자열이면 16바이트로 변환
        if (serverKey.matches("^[0-9a-fA-F]{32}$")) {
            byte[] out = new byte[16];

            for (int i = 0; i < 16; i++) {
                String hex = serverKey.substring(i * 2, i * 2 + 2);
                out[i] = (byte) Integer.parseInt(hex, 16);
            }

            return out;
        }

        // 아니면 16바이트 ASCII/UTF-8 키로 처리
        byte[] utf8Bytes = serverKey.getBytes(StandardCharsets.UTF_8);

        if (utf8Bytes.length != 16) {
            throw new IllegalArgumentException(
                    "serverKey 바이트 길이가 " + utf8Bytes.length + "입니다. AES-128은 16바이트여야 합니다."
            );
        }

        return utf8Bytes;
    }

    private byte[] base64ToBytes(String token) {
        String fixed = token
                .replace("-", "+")
                .replace("_", "/");

        int pad = fixed.length() % 4;

        if (pad != 0) {
            fixed += "=".repeat(4 - pad);
        }

        return Base64.getDecoder().decode(fixed);
    }
}