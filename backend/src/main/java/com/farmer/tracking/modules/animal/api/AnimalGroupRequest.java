package com.farmer.tracking.modules.animal.api;

import com.farmer.tracking.modules.animal.entity.AnimalType;
import com.farmer.tracking.modules.animal.entity.ProductionPurpose;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Schema(description = "Payload for creating or updating an animal group")
public class AnimalGroupRequest {

    @NotNull(message = "Animal type is required")
    @Schema(description = "Type of animal", example = "CATTLE", required = true)
    private AnimalType type;

    @NotNull(message = "Production purpose is required")
    @Schema(description = "Production purpose of the group", example = "MEAT", required = true)
    private ProductionPurpose purpose;

    @NotNull(message = "Number of animals is required")
    @Positive(message = "Number of animals must be a positive number")
    @Schema(description = "Number of animals in the group", example = "25", required = true)
    private Integer numberOfAnimals;

    @NotNull(message = "Start date is required")
    @Schema(description = "Date the group was started", example = "2026-01-15", required = true)
    private LocalDate startDate;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    @Schema(description = "Optional notes about the animal group", example = "Dairy cows, Holstein breed")
    private String notes;

    public AnimalGroupRequest() {}

    public AnimalGroupRequest(AnimalType type, ProductionPurpose purpose, Integer numberOfAnimals,
                              LocalDate startDate, String notes) {
        this.type = type;
        this.purpose = purpose;
        this.numberOfAnimals = numberOfAnimals;
        this.startDate = startDate;
        this.notes = notes;
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
}
