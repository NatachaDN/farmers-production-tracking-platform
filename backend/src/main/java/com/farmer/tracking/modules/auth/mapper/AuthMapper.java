package com.farmer.tracking.modules.auth.mapper;

import com.farmer.tracking.modules.auth.dto.FarmerProfileResponse;
import com.farmer.tracking.modules.auth.dto.RegisterRequest;
import com.farmer.tracking.modules.auth.model.Farmer;
import org.springframework.stereotype.Component;

@Component
public class AuthMapper {

    public Farmer toEntity(RegisterRequest request, String encodedPassword) {
        if (request == null) {
            return null;
        }

        Farmer farmer = new Farmer();
        farmer.setFullName(request.getFullName().trim());
        farmer.setEmailOrPhone(request.getEmailOrPhone().trim().toLowerCase());
        farmer.setLocation(request.getLocation() != null ? request.getLocation().trim() : null);
        farmer.setFarmType(request.getFarmType());
        farmer.setPasswordHash(encodedPassword);
        farmer.setRole("ROLE_FARMER");
        farmer.setAgreedToTerms(request.isAgreedToTerms());
        return farmer;
    }

    public FarmerProfileResponse toProfileResponse(Farmer farmer) {
        if (farmer == null) {
            return null;
        }

        return new FarmerProfileResponse(
                farmer.getId(),
                farmer.getFullName(),
                farmer.getEmailOrPhone(),
                farmer.getLocation(),
                farmer.getFarmType(),
                farmer.getRole(),
                farmer.getCreatedAt()
        );
    }
}
