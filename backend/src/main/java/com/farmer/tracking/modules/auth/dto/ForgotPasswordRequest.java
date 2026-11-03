package com.farmer.tracking.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ForgotPasswordRequest {

    @NotBlank(message = "Email or phone number is required")
    @Size(min = 3, max = 120, message = "Email or phone number must be between 3 and 120 characters")
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
