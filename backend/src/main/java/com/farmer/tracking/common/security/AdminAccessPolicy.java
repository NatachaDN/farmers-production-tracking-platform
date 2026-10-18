package com.farmer.tracking.common.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Decides which email addresses are allowed to hold the administrator role.
 * The list comes from {@code app.admin.emails} (env var {@code ADMIN_EMAILS}).
 * It is only applied to emails verified by Google, never to self-registered accounts.
 */
@Component
public class AdminAccessPolicy {

    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_FARMER = "ROLE_FARMER";

    private final Set<String> adminEmails;

    public AdminAccessPolicy(@Value("${app.admin.emails:}") String rawEmails) {
        this.adminEmails = Arrays.stream(rawEmails == null ? new String[0] : rawEmails.split(","))
                .map(s -> s.trim().toLowerCase(Locale.ROOT))
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toUnmodifiableSet());
    }

    public boolean isAdminEmail(String email) {
        return email != null && adminEmails.contains(email.trim().toLowerCase(Locale.ROOT));
    }
}
