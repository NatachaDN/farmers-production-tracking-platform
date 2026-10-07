package com.farmer.tracking.modules.farm.mapper;

import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.farm.dto.CreateFarmRequest;
import com.farmer.tracking.modules.farm.dto.FarmResponse;
import com.farmer.tracking.modules.farm.dto.UpdateFarmRequest;
import com.farmer.tracking.modules.farm.model.Farm;
import org.springframework.stereotype.Component;

@Component
public class FarmMapper {

    public Farm toEntity(CreateFarmRequest request, Farmer farmer) {
        Farm farm = new Farm();
        farm.setFarmer(farmer);
        farm.setName(request.getName().trim());
        farm.setType(request.getType());
        farm.setSize(request.getSize());
        farm.setSizeUnit(request.getSizeUnit());
        farm.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        farm.setStatus(request.getStatus());
        farm.setCountry(request.getCountry().trim());
        farm.setRegion(request.getRegion().trim());
        farm.setDistrict(request.getDistrict().trim());
        farm.setMapImageUrl(request.getMapImageUrl() != null ? request.getMapImageUrl().trim() : null);
        farm.setSoilType(request.getSoilType());
        farm.setSlope(request.getSlope());
        farm.setAccessToWater(request.getAccessToWater());
        farm.setAdditionalNotes(request.getAdditionalNotes() != null ? request.getAdditionalNotes().trim() : null);
        return farm;
    }

    public void updateEntityFromDto(UpdateFarmRequest request, Farm farm) {
        farm.setName(request.getName().trim());
        farm.setType(request.getType());
        farm.setSize(request.getSize());
        farm.setSizeUnit(request.getSizeUnit());
        farm.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        farm.setStatus(request.getStatus());
        farm.setCountry(request.getCountry().trim());
        farm.setRegion(request.getRegion().trim());
        farm.setDistrict(request.getDistrict().trim());
        farm.setMapImageUrl(request.getMapImageUrl() != null ? request.getMapImageUrl().trim() : null);
        farm.setSoilType(request.getSoilType());
        farm.setSlope(request.getSlope());
        farm.setAccessToWater(request.getAccessToWater());
        farm.setAdditionalNotes(request.getAdditionalNotes() != null ? request.getAdditionalNotes().trim() : null);
    }

    public FarmResponse toResponse(Farm farm) {
        FarmResponse response = new FarmResponse();
        response.setId(farm.getId());
        if (farm.getFarmer() != null) {
            response.setFarmerId(farm.getFarmer().getId());
            response.setFarmerName(farm.getFarmer().getFullName());
        }
        response.setName(farm.getName());
        response.setType(farm.getType());
        response.setSize(farm.getSize());
        response.setSizeUnit(farm.getSizeUnit());
        response.setDescription(farm.getDescription());
        response.setStatus(farm.getStatus());
        response.setCountry(farm.getCountry());
        response.setRegion(farm.getRegion());
        response.setDistrict(farm.getDistrict());
        response.setMapImageUrl(farm.getMapImageUrl());
        response.setSoilType(farm.getSoilType());
        response.setSlope(farm.getSlope());
        response.setAccessToWater(farm.getAccessToWater());
        response.setAdditionalNotes(farm.getAdditionalNotes());
        response.setCreatedAt(farm.getCreatedAt());
        response.setUpdatedAt(farm.getUpdatedAt());
        return response;
    }
}
