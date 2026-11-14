package com.farmer.tracking.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {

    @NotBlank(message = "Email or phone number is required")
    private String emailOrPhone;

    @NotBlank(message = "Reset code is required")
    private String resetCode;

    @NotBlank(message = "New password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String newPassword;

    @NotBlank(message = "Password confirmation is required")
    private String confirmPassword;

    public ResetPasswordRequest() {
    }

    public ResetPasswordRequest(String emailOrPhone, String resetCode, String newPassword) {
        this(emailOrPhone, resetCode, newPassword, newPassword);
    }

    public ResetPasswordRequest(String emailOrPhone, String resetCode, String newPassword, String confirmPassword) {
        this.emailOrPhone = emailOrPhone;
        this.resetCode = resetCode;
        this.newPassword = newPassword;
        this.confirmPassword = confirmPassword;
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

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
}
