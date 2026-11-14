package com.farmer.tracking.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when a login is attempted on an account that is temporarily locked
 * after too many consecutive failed attempts (HTTP 423 Locked).
 */
public class AccountLockedException extends ApiException {

    public AccountLockedException(String message) {
        super(message, HttpStatus.LOCKED);
    }
}
