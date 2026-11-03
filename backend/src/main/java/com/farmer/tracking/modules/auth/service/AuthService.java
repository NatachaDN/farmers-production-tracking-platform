package com.farmer.tracking.modules.auth.service;

import com.farmer.tracking.modules.auth.dto.*;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    FarmerProfileResponse getCurrentFarmer(String emailOrPhone);

    FarmerProfileResponse updateProfile(String emailOrPhone, UpdateProfileRequest request);

    ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request);

    ResetPasswordResponse resetPassword(ResetPasswordRequest request);

    FarmerProfileResponse uploadAvatar(String emailOrPhone, MultipartFile file);

    Resource loadAvatar(String fileName);
}
