package com.farmer.tracking.modules.farm.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Payload for creating or updating a farmer's farm")
public class FarmRequest {

    @NotBlank(message = "Farm name is required")
    @Size(min = 2, max = 120, message = "Farm name must be between 2 and 120 characters")
    @Schema(description = "Name of the farm", example = "Green Acres Farm")
    private String name;

    @Schema(description = "General location or county", example = "Nakuru County, Kenya")
    private String location;

    @Schema(description = "Description or farm classification", example = "Main farm")
    private String description;

    @Schema(description = "Country of the farm", example = "Kenya")
    private String country;

    @Schema(description = "District or county", example = "Nakuru")
    private String district;

    @Schema(description = "Whether this farm should be the default container for plots", example = "true")
    private Boolean isDefault;

    public FarmRequest() {}

    public FarmRequest(String name, String location, String description, Boolean isDefault) {
        this.name = name;
        this.location = location;
        this.description = description;
        this.isDefault = isDefault;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }
}
