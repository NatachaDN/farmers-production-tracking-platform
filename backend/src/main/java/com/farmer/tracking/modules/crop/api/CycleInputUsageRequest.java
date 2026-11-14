package com.farmer.tracking.modules.crop.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Schema(description = "Payload for recording an input quantity used on a production cycle")
public class CycleInputUsageRequest {

    @NotNull(message = "Input ID is required")
    @Schema(description = "ID of the farm input in inventory to be consumed", example = "2")
    private Long inputId;

    @NotNull(message = "Quantity used is required")
    @DecimalMin(value = "0.01", message = "Quantity used must be greater than 0")
    @Schema(description = "Amount of input applied to this cycle (deducted from available stock)", example = "50.0")
    private Double quantityUsed;

    @Schema(description = "Date when the input was applied (defaults to today if omitted)", example = "2026-10-15")
    private LocalDate usageDate;

    @Schema(description = "Crop growth stage at application", example = "Vegetative Growth")
    private String growthStage;

    @Schema(description = "Method used to apply the input", example = "Top Dressing / Side Band")
    private String applicationMethod;

    @Schema(description = "Cultivated area treated in hectares", example = "1.5")
    private Double areaCovered;

    @Schema(description = "Person or team who applied the input", example = "Farm Owner")
    private String appliedBy;

    @Schema(description = "Optional application notes, dosage/dilution rate, or weather context", example = "Applied along rows early morning")
    private String notes;

    public CycleInputUsageRequest() {
    }

    public CycleInputUsageRequest(Long inputId, Double quantityUsed, LocalDate usageDate, String notes) {
        this.inputId = inputId;
        this.quantityUsed = quantityUsed;
        this.usageDate = usageDate;
        this.notes = notes;
    }

    public Long getInputId() {
        return inputId;
    }

    public void setInputId(Long inputId) {
        this.inputId = inputId;
    }

    public Double getQuantityUsed() {
        return quantityUsed;
    }

    public void setQuantityUsed(Double quantityUsed) {
        this.quantityUsed = quantityUsed;
    }

    public LocalDate getUsageDate() {
        return usageDate;
    }

    public void setUsageDate(LocalDate usageDate) {
        this.usageDate = usageDate;
    }

    public String getGrowthStage() {
        return growthStage;
    }

    public void setGrowthStage(String growthStage) {
        this.growthStage = growthStage;
    }

    public String getApplicationMethod() {
        return applicationMethod;
    }

    public void setApplicationMethod(String applicationMethod) {
        this.applicationMethod = applicationMethod;
    }

    public Double getAreaCovered() {
        return areaCovered;
    }

    public void setAreaCovered(Double areaCovered) {
        this.areaCovered = areaCovered;
    }

    public String getAppliedBy() {
        return appliedBy;
    }

    public void setAppliedBy(String appliedBy) {
        this.appliedBy = appliedBy;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
