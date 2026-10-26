package com.farmer.tracking.modules.auth.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "farmers", indexes = {
        @Index(name = "idx_farmer_email_phone", columnList = "email_or_phone", unique = true)
})
public class Farmer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(name = "email_or_phone", nullable = false, unique = true, length = 120)
    private String emailOrPhone;

    @Column(name = "location", length = 180)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "farm_type", nullable = false, length = 30)
    private FarmType farmType;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "role", nullable = false, length = 40)
    private String role = "ROLE_FARMER";

    @Column(name = "agreed_to_terms", nullable = false)
    private boolean agreedToTerms = true;

    /** LOCAL (email/phone + password) or GOOGLE. Null on rows created before this column existed. */
    @Column(name = "auth_provider", length = 20)
    private String authProvider = "LOCAL";

    /** Google account identifier ("sub" claim); null for accounts that never used Google sign-in. */
    @Column(name = "google_id", length = 64, unique = true)
    private String googleId;

    @Column(name = "avatar_url", length = 1024)
    private String avatarUrl;

    @Column(name = "farm_name", length = 120)
    private String farmName;

    @Column(name = "crops_grown", length = 255)
    private String cropsGrown;

    @Column(name = "total_area")
    private Double totalArea = 0.0;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Farmer() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
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

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isAgreedToTerms() {
        return agreedToTerms;
    }

    public void setAgreedToTerms(boolean agreedToTerms) {
        this.agreedToTerms = agreedToTerms;
    }

    public String getAuthProvider() {
        return authProvider != null ? authProvider : "LOCAL";
    }

    public void setAuthProvider(String authProvider) {
        this.authProvider = authProvider;
    }

    public String getGoogleId() {
        return googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getFarmName() {
        return farmName;
    }

    public void setFarmName(String farmName) {
        this.farmName = farmName;
    }

    public String getCropsGrown() {
        return cropsGrown;
    }

    public void setCropsGrown(String cropsGrown) {
        this.cropsGrown = cropsGrown;
    }

    public Double getTotalArea() {
        return totalArea;
    }

    public void setTotalArea(Double totalArea) {
        this.totalArea = totalArea;
    }

    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
