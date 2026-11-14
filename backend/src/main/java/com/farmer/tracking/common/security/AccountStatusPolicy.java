package com.farmer.tracking.common.security;

import com.farmer.tracking.common.exception.ForbiddenException;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.model.RegistrationStatus;

/**
 * Single place deciding whether an account may sign in or keep using a session.
 * Only APPROVED accounts are active; PENDING, REJECTED and SUSPENDED accounts are blocked
 * both at sign-in and on every authenticated request.
 */
public final class AccountStatusPolicy {

    private AccountStatusPolicy() {}

    public static boolean isActive(Farmer farmer) {
        return farmer != null
                && (farmer.getStatus() == null || farmer.getStatus() == RegistrationStatus.APPROVED);
    }

    /** Throws a 403 with a user-facing explanation when the account may not sign in. */
    public static void assertCanSignIn(Farmer farmer) {
        if (isActive(farmer)) {
            return;
        }
        String reason = farmer.getRejectionReason();
        boolean hasReason = reason != null && !reason.isBlank();
        switch (farmer.getStatus()) {
            case PENDING -> throw new ForbiddenException(
                    "Your registration is awaiting approval by a manager or administrator. "
                            + "You will be able to sign in once it is approved.");
            case REJECTED -> throw new ForbiddenException(hasReason
                    ? "Your registration was rejected: " + reason
                    : "Your farmer registration has been rejected by the platform manager. Please contact support.");
            case SUSPENDED -> throw new ForbiddenException(hasReason
                    ? "Your account has been suspended: " + reason
                    : "Your account has been suspended by an administrator. Please contact support.");
            default -> throw new ForbiddenException("Your account is not active.");
        }
    }
}
