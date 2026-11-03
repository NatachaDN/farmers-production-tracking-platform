package com.farmer.tracking.modules.crop.api;

import com.farmer.tracking.modules.crop.entity.Crop;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Response representing a registered crop from the farmer's personal list")
public class CropResponse {

    @Schema(description = "Unique crop ID", example = "1")
    private Long id;

    @Schema(description = "Farmer ID who owns this crop record", example = "1")
    private Long farmerId;

    @Schema(description = "Crop name", example = "Maize")
    private String name;

    @Schema(description = "Crop variety", example = "Hybrid 614")
    private String variety;

    @Schema(description = "Formatted display label combining name and variety", example = "Maize (Hybrid 614)")
    private String displayName;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;

    public CropResponse() {}

    public CropResponse(Long id, Long farmerId, String name, String variety, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.farmerId = farmerId;
        this.name = name;
        this.variety = variety;
        this.displayName = (variety != null && !variety.isBlank())
                ? name + " (" + variety.trim() + ")"
                : name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static CropResponse fromEntity(Crop crop) {
        if (crop == null) return null;
        return new CropResponse(
                crop.getId(),
                crop.getFarmerId(),
                crop.getName(),
                crop.getVariety(),
                crop.getCreatedAt(),
                crop.getUpdatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(Long farmerId) {
        this.farmerId = farmerId;
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

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
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
