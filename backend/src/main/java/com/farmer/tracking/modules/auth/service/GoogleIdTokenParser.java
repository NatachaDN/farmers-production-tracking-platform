package com.farmer.tracking.modules.auth.service;

import com.farmer.tracking.common.exception.UnauthorizedException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.time.Instant;
import java.util.Base64;
import java.util.Locale;

/**
 * Reads and validates the claims of a Google ID token.
 * <p>
 * The token is received by the backend directly from Google's token endpoint over TLS, in exchange
 * for an authorization code and the client secret. In that case Google documents that the
 * signature check can be skipped; the issuer, audience, expiry and email checks below are still
 * enforced. Never feed this parser a token that came from the browser.
 */
public final class GoogleIdTokenParser {

    private static final long CLOCK_SKEW_SECONDS = 60;

    private GoogleIdTokenParser() {}

    public static GoogleIdentity parse(String idToken, String expectedAudience, Instant now, ObjectMapper mapper) {
        if (idToken == null || expectedAudience == null || expectedAudience.isBlank()) {
            throw invalid();
        }
        String[] parts = idToken.split("\\.");
        if (parts.length != 3) {
            throw invalid();
        }

        JsonNode claims;
        try {
            claims = mapper.readTree(Base64.getUrlDecoder().decode(parts[1]));
        } catch (IOException | IllegalArgumentException ex) {
            throw invalid();
        }

        String issuer = text(claims, "iss");
        if (!"https://accounts.google.com".equals(issuer) && !"accounts.google.com".equals(issuer)) {
            throw invalid();
        }
        if (!audienceMatches(claims.get("aud"), expectedAudience)) {
            throw invalid();
        }
        long exp = claims.path("exp").asLong(0);
        if (exp + CLOCK_SKEW_SECONDS < now.getEpochSecond()) {
            throw new UnauthorizedException("The Google sign-in has expired. Please try again.");
        }

        String subject = text(claims, "sub");
        String email = text(claims, "email");
        if (subject == null || email == null) {
            throw invalid();
        }
        JsonNode verified = claims.get("email_verified");
        boolean emailVerified = verified != null
                && (verified.asBoolean(false) || "true".equalsIgnoreCase(verified.asText()));
        if (!emailVerified) {
            throw new UnauthorizedException("Your Google email address is not verified.");
        }

        return new GoogleIdentity(subject, email.trim().toLowerCase(Locale.ROOT), text(claims, "name"), text(claims, "picture"));
    }

    private static boolean audienceMatches(JsonNode aud, String expected) {
        if (aud == null) {
            return false;
        }
        if (aud.isArray()) {
            for (JsonNode node : aud) {
                if (expected.equals(node.asText())) {
                    return true;
                }
            }
            return false;
        }
        return expected.equals(aud.asText());
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value == null || value.isNull() || value.asText().isBlank()) {
            return null;
        }
        return value.asText();
    }

    private static UnauthorizedException invalid() {
        return new UnauthorizedException("Google sign-in could not be verified. Please try again.");
    }
}
