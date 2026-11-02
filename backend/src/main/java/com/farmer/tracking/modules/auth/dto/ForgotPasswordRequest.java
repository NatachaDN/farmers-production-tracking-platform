package com.farmer.tracking.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class ForgotPasswordRequest {

    @NotBlank(message = "Email or phone number is required")
    private String emailOrPhone;

    public ForgotPasswordRequest() {}

    public ForgotPasswordRequest(String emailOrPhone) {
        this.emailOrPhone = emailOrPhone;
    }

    public String getEmailOrPhone() {
        return emailOrPhone;
    }

    public void setEmailOrPhone(String emailOrPhone) {
        this.emailOrPhone = emailOrPhone;
    }
}

