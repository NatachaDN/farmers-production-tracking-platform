package com.farmer.tracking.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final SecretKey secretKey;
    private final long jwtExpirationMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret:}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long jwtExpirationMs) {
        if (secret == null || secret.isBlank()) {
            // No secret configured: never fall back to a publicly known key.
            // A random key keeps the app usable, but tokens become invalid on every restart.
            log.warn("JWT_SECRET is not set: using a random signing key. Users must sign in again after each restart. "
                    + "Set JWT_SECRET (Base64, at least 32 bytes) in the environment for stable sessions.");
            byte[] random = new byte[64];
            new java.security.SecureRandom().nextBytes(random);
            this.secretKey = Keys.hmacShaKeyFor(random);
        } else {
            this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret.trim()));
        }
        this.jwtExpirationMs = jwtExpirationMs;
    }

    public String generateToken(Long farmerId, String emailOrPhone) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(emailOrPhone)
                .claim("farmerId", farmerId)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.warn("Invalid JWT token: {}", ex.getMessage());
            return false;
        }
    }
}
