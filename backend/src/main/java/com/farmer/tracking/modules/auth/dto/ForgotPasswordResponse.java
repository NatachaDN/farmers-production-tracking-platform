package com.farmer.tracking.modules.auth.dto;

public class ForgotPasswordResponse {

    private String message;
    private String emailOrPhone;
    private String resetCode;

    public ForgotPasswordResponse() {}

    public ForgotPasswordResponse(String message) {
        this.message = message;
    }

    public ForgotPasswordResponse(String message, String emailOrPhone, String resetCode) {
        this.message = message;
        this.emailOrPhone = emailOrPhone;
        this.resetCode = resetCode;
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

    public String getResetCode() {
        return resetCode;
    }

    public void setResetCode(String resetCode) {
        this.resetCode = resetCode;
    }
}
