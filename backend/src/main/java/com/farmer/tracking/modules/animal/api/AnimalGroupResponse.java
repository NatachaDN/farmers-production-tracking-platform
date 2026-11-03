package com.farmer.tracking.modules.animal.api;

import com.farmer.tracking.modules.animal.entity.AnimalGroup;
import com.farmer.tracking.modules.animal.entity.AnimalType;
import com.farmer.tracking.modules.animal.entity.ProductionPurpose;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(description = "Represents an animal group owned by a farmer")
public class AnimalGroupResponse {

    @Schema(description = "Animal group ID", example = "1")
    private Long id;

    @Schema(description = "Farmer ID", example = "1")
    private Long farmerId;

    @Schema(description = "Type of animal", example = "CATTLE")
    private AnimalType type;

    @Schema(description = "Production purpose", example = "MEAT")
    private ProductionPurpose purpose;

    @Schema(description = "Number of animals in the group", example = "25")
    private Integer numberOfAnimals;

    @Schema(description = "Start date of the group", example = "2026-01-15")
    private LocalDate startDate;

    @Schema(description = "Optional notes about the animal group", example = "Dairy cows, Holstein breed")
    private String notes;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;

    public AnimalGroupResponse() {}

    public static AnimalGroupResponse fromEntity(AnimalGroup group) {
        AnimalGroupResponse resp = new AnimalGroupResponse();
        resp.setId(group.getId());
        resp.setFarmerId(group.getFarmerId());
        resp.setType(group.getType());
        resp.setPurpose(group.getPurpose());
        resp.setNumberOfAnimals(group.getNumberOfAnimals());
        resp.setStartDate(group.getStartDate());
        resp.setNotes(group.getNotes());
        resp.setCreatedAt(group.getCreatedAt());
        resp.setUpdatedAt(group.getUpdatedAt());
        return resp;
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

    public AnimalType getType() {
        return type;
    }

    public void setType(AnimalType type) {
        this.type = type;
    }

    public ProductionPurpose getPurpose() {
        return purpose;
    }

    public void setPurpose(ProductionPurpose purpose) {
        this.purpose = purpose;
    }

    public Integer getNumberOfAnimals() {
        return numberOfAnimals;
    }

    public void setNumberOfAnimals(Integer numberOfAnimals) {
        this.numberOfAnimals = numberOfAnimals;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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
