package com.farmer.tracking.modules.auth.dto;

import com.farmer.tracking.modules.auth.model.FarmType;
import java.time.LocalDateTime;

public class FarmerProfileResponse {

    private Long id;
    private String fullName;
    private String emailOrPhone;
    private String location;
    private FarmType farmType;
    private String role;
    private LocalDateTime createdAt;
    private String avatarUrl;
    private String authProvider;

    public FarmerProfileResponse() {}

    public FarmerProfileResponse(Long id, String fullName, String emailOrPhone, String location, FarmType farmType, String role, LocalDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.emailOrPhone = emailOrPhone;
        this.location = location;
        this.farmType = farmType;
        this.role = role;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmailOrPhone() {
        return emailOrPhone;
    }

    public void setEmailOrPhone(String emailOrPhone) {
        this.emailOrPhone = emailOrPhone;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public FarmType getFarmType() {
        return farmType;
    }

    public void setFarmType(FarmType farmType) {
        this.farmType = farmType;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getAuthProvider() {
        return authProvider;
    }

    public void setAuthProvider(String authProvider) {
        this.authProvider = authProvider;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
