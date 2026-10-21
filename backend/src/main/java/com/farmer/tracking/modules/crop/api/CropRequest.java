package com.farmer.tracking.modules.crop.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Payload for registering or updating a crop in the farmer's personal list")
public class CropRequest {

    @NotBlank(message = "Crop name is required")
    @Size(max = 120, message = "Crop name must not exceed 120 characters")
    @Schema(description = "Name of the crop", example = "Maize")
    private String name;

    @Size(max = 120, message = "Variety must not exceed 120 characters")
    @Schema(description = "Optional variety or cultivar of the crop", example = "Hybrid 614")
    private String variety;

    public CropRequest() {}

    public CropRequest(String name, String variety) {
        this.name = name;
        this.variety = variety;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVariety() {
        return variety;
    }

    public void setVariety(String variety) {
        this.variety = variety;
    }
}
