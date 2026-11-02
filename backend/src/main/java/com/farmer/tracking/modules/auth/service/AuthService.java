package com.farmer.tracking.modules.auth.service;

import com.farmer.tracking.modules.auth.dto.AuthResponse;
import com.farmer.tracking.modules.auth.dto.FarmerProfileResponse;
import com.farmer.tracking.modules.auth.dto.ForgotPasswordRequest;
import com.farmer.tracking.modules.auth.dto.ForgotPasswordResponse;
import com.farmer.tracking.modules.auth.dto.LoginRequest;
import com.farmer.tracking.modules.auth.dto.RegisterRequest;
import com.farmer.tracking.modules.auth.dto.ResetPasswordRequest;
import com.farmer.tracking.modules.auth.dto.ResetPasswordResponse;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    FarmerProfileResponse getCurrentFarmer(String emailOrPhone);

    ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request);

    ResetPasswordResponse resetPassword(ResetPasswordRequest request);

    FarmerProfileResponse uploadAvatar(String emailOrPhone, MultipartFile file);

    Resource loadAvatar(String fileName);
}
