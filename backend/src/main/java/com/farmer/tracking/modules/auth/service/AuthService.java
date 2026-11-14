package com.farmer.tracking.modules.auth.service;

import com.farmer.tracking.modules.auth.dto.*;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    FarmerProfileResponse getCurrentFarmer(String emailOrPhone);

    FarmerProfileResponse updateProfile(String emailOrPhone, UpdateProfileRequest request);

    ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request);

    ResetPasswordResponse resetPassword(ResetPasswordRequest request);

    FarmerProfileResponse uploadAvatar(String emailOrPhone, MultipartFile file);

    Resource loadAvatar(String fileName);

    PasswordChangeRequestResponse requestPasswordChange(String emailOrPhone, ChangePasswordRequest request);

    List<PasswordChangeRequestResponse> getMyPasswordChangeRequests(String emailOrPhone);

    PasswordChangeRequestResponse cancelPasswordChangeRequest(String emailOrPhone, Long requestId);
}
