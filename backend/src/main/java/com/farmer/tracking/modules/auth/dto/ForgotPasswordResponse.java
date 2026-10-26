package com.farmer.tracking.modules.auth.dto;

/**
 * Response returned after a successful forgot-password request.
 * The reset code is NOT included here — it is sent to the user's email only.
 */
public class ForgotPasswordResponse {

    private String message;
    private String emailOrPhone;

    public ForgotPasswordResponse() {}

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
