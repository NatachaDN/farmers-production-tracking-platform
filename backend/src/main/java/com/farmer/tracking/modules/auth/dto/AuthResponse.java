package com.farmer.tracking.modules.auth.dto;

public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private FarmerProfileResponse farmer;
    private String message;

    public AuthResponse() {}

    public AuthResponse(String token, FarmerProfileResponse farmer, String message) {
        this.token = token;
        this.farmer = farmer;
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public FarmerProfileResponse getFarmer() {
        return farmer;
    }

    public void setFarmer(FarmerProfileResponse farmer) {
        this.farmer = farmer;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
