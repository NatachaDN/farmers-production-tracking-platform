package com.farmer.tracking.modules.auth.dto;

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
