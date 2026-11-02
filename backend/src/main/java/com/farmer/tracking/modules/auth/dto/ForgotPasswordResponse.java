package com.farmer.tracking.modules.auth.dto;

public class ForgotPasswordResponse {

    private String message;
    private String resetCode;

    public ForgotPasswordResponse() {}

    public ForgotPasswordResponse(String message) {
        this.message = message;
    }

    public ForgotPasswordResponse(String message, String resetCode) {
        this.message = message;
        this.resetCode = resetCode;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getResetCode() {
        return resetCode;
    }

    public void setResetCode(String resetCode) {
        this.resetCode = resetCode;
    }
}

