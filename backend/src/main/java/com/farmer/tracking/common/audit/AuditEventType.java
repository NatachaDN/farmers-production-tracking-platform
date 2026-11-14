package com.farmer.tracking.common.audit;

/**
 * Security and account events recorded for the administration console.
 */
public enum AuditEventType {
    REGISTER,
    LOGIN,
    LOGIN_FAILED,
    GOOGLE_REGISTER,
    GOOGLE_LOGIN,
    GOOGLE_LOGIN_FAILED,
    PASSWORD_RESET_REQUESTED,
    PASSWORD_RESET_COMPLETED,
    PASSWORD_RESET,
    ACCOUNT_ACCESS_CHANGED,
    HARVEST_DELETED
}
