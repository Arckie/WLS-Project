package com.backend_semi.passwordless.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "passwordless")
public class PasswordlessProperties {
        private String authServerUrl;
        private String pushConnectorUrl;
        private String pushConnectorToken;
        private String serverId;
        private String serverKey;
}
