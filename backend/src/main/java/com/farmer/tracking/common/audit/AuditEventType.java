package com.farmer.tracking.common.audit;

/**
 * Account-level events recorded for the administration console.
 */
public enum AuditEventType {
    REGISTER,
    LOGIN,
    LOGIN_FAILED,
    GOOGLE_REGISTER,
    GOOGLE_LOGIN,
    GOOGLE_LOGIN_FAILED,
    PASSWORD_RESET_REQUESTED,
    PASSWORD_RESET
}
