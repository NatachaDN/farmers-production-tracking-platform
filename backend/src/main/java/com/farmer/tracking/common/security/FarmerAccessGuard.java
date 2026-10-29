package com.farmer.tracking.common.security;

import com.farmer.tracking.common.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Shared guard that enforces farmer data isolation at the service layer.
 * <p>
 * When a farmer (non-admin principal) is authenticated, access is only allowed
 * when the requested {@code farmerId} matches the authenticated principal's
 * own farmer id. Administrators (ROLE_ADMIN) may access any farmer's data.
 * </p>
 */
public final class FarmerAccessGuard {

    private FarmerAccessGuard() {
    }

    /**
     * Validates that the authenticated principal may access the given farmer's data.
     *
     * @param farmerId the farmer id being accessed
     * @param resource a human-readable resource label used in the error message
     * @throws UnauthorizedException if the authenticated user is neither the owner nor an admin
     */
    public static void validateFarmerAccess(Long farmerId, String resource) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            return;
        }
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (!isAdmin && !principal.getId().equals(farmerId)) {
            throw new UnauthorizedException(
                    "Access denied: You can only access your own " + resource + " records.");
        }
    }
}
