package com.farmer.tracking.modules.auth;

import com.farmer.tracking.common.exception.UnauthorizedException;
import com.farmer.tracking.modules.auth.service.GoogleIdTokenParser;
import com.farmer.tracking.modules.auth.service.GoogleIdentity;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class GoogleIdTokenParserTest {

    private static final String AUDIENCE = "my-client.apps.googleusercontent.com";
    private final ObjectMapper mapper = new ObjectMapper();
    private final Instant now = Instant.now();

    private String token(String issuer, String audience, long exp, boolean emailVerified) {
        String payload = "{\"iss\":\"" + issuer + "\",\"aud\":\"" + audience + "\",\"exp\":" + exp
                + ",\"sub\":\"1234\",\"email\":\"Joyce@Gmail.com\",\"email_verified\":" + emailVerified
                + ",\"name\":\"Joyce M\",\"picture\":\"https://example.com/p.png\"}";
        Base64.Encoder enc = Base64.getUrlEncoder().withoutPadding();
        return enc.encodeToString("{\"alg\":\"RS256\"}".getBytes(StandardCharsets.UTF_8)) + "."
                + enc.encodeToString(payload.getBytes(StandardCharsets.UTF_8)) + ".signature";
    }

    @Test
    void validToken_returnsNormalisedIdentity() {
        String jwt = token("https://accounts.google.com", AUDIENCE, now.getEpochSecond() + 3600, true);

        GoogleIdentity identity = GoogleIdTokenParser.parse(jwt, AUDIENCE, now, mapper);

        assertEquals("1234", identity.subject());
        assertEquals("joyce@gmail.com", identity.email());
        assertEquals("Joyce M", identity.name());
    }

    @Test
    void wrongAudience_isRejected() {
        String jwt = token("https://accounts.google.com", "someone-else", now.getEpochSecond() + 3600, true);
        assertThrows(UnauthorizedException.class, () -> GoogleIdTokenParser.parse(jwt, AUDIENCE, now, mapper));
    }

    @Test
    void wrongIssuer_isRejected() {
        String jwt = token("https://evil.example.com", AUDIENCE, now.getEpochSecond() + 3600, true);
        assertThrows(UnauthorizedException.class, () -> GoogleIdTokenParser.parse(jwt, AUDIENCE, now, mapper));
    }

    @Test
    void expiredToken_isRejected() {
        String jwt = token("https://accounts.google.com", AUDIENCE, now.getEpochSecond() - 7200, true);
        assertThrows(UnauthorizedException.class, () -> GoogleIdTokenParser.parse(jwt, AUDIENCE, now, mapper));
    }

    @Test
    void unverifiedEmail_isRejected() {
        String jwt = token("https://accounts.google.com", AUDIENCE, now.getEpochSecond() + 3600, false);
        assertThrows(UnauthorizedException.class, () -> GoogleIdTokenParser.parse(jwt, AUDIENCE, now, mapper));
    }

    @Test
    void malformedToken_isRejected() {
        assertThrows(UnauthorizedException.class, () -> GoogleIdTokenParser.parse("not-a-jwt", AUDIENCE, now, mapper));
    }
}
