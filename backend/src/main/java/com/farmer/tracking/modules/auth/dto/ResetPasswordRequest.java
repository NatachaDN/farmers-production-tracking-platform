package com.farmer.tracking.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {

    @NotBlank(message = "Email or phone number is required")
    @Size(min = 3, max = 120, message = "Email or phone number must be between 3 and 120 characters")
    private String emailOrPhone;

    @NotBlank(message = "Reset code is required")
    private String resetCode;

    @NotBlank(message = "New password is required")
    @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
    private String newPassword;

    public ResetPasswordRequest() {}

    public ResetPasswordRequest(String emailOrPhone, String resetCode, String newPassword) {
        this.emailOrPhone = emailOrPhone;
        this.resetCode = resetCode;
        this.newPassword = newPassword;
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

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
