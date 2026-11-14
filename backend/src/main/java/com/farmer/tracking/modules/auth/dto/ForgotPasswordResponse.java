package com.farmer.tracking.modules.auth.dto;

/**
 * Answer to a "forgot password" request. It never contains the reset code itself:
 * the code is only delivered by email.
 */
public class ForgotPasswordResponse {

    private String message;
    private String emailOrPhone;

    public ForgotPasswordResponse() {}

    public ForgotPasswordResponse(String message) {
        this.message = message;
    }

    public ForgotPasswordResponse(String message, String emailOrPhone) {
        this.message = message;
        this.emailOrPhone = emailOrPhone;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getEmailOrPhone() {
        return emailOrPhone;
    }

    public void setEmailOrPhone(String emailOrPhone) {
        this.emailOrPhone = emailOrPhone;
    }
}
