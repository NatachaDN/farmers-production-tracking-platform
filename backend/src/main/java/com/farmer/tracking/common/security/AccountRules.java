package com.farmer.tracking.common.security;

import com.farmer.tracking.common.exception.BadRequestException;
import java.nio.charset.StandardCharsets;

public final class AccountRules {
    private AccountRules() {}

    public static void identifier(String value) {
        if (value == null || !value.trim().matches("(?:[^\\s@]+@[^\\s@]+\\.[^\\s@]+|\\+?[0-9][0-9 ()-]{5,18}[0-9])")) {
            throw new BadRequestException("Enter a valid email address or phone number.");
        }
    }

    public static void password(String value) {
        if (value == null || value.length() < 8 || value.getBytes(StandardCharsets.UTF_8).length > 72
                || !value.matches("(?s).*[A-Za-z].*") || !value.matches("(?s).*[0-9].*")) {
            throw new BadRequestException("Password must have at least 8 characters, a letter and a number, and fit within 72 bytes.");
        }
    }
}
