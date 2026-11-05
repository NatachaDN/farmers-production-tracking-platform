package com.farmer.tracking.common.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import static org.assertj.core.api.Assertions.*;

class JwtTokenProviderTest {
    private static final String LOCAL_KEY = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @Test void missingAndPublicProductionKeysPreventStartup() {
        var production = new MockEnvironment().withProperty("spring.profiles.active", "prod");
        assertThatThrownBy(() -> new JwtTokenProvider("", 60000, production)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new JwtTokenProvider(LOCAL_KEY, 60000, production)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test void tokenPreservesTheAccountSessionVersion() {
        var local = new MockEnvironment(); local.setActiveProfiles("local");
        var provider = new JwtTokenProvider(LOCAL_KEY, 60000, local);
        var token = provider.generateToken(1L, "farmer@example.test", 3L);
        assertThat(provider.validateToken(token)).isTrue();
        assertThat(provider.getTokenVersion(token)).isEqualTo(3L);
    }
}
