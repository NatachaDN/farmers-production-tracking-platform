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

    @Schema(description = "Optional application notes or growth stage context", example = "Top-dressing fertilizer applied along rows")
    private String notes;

    public CycleInputUsageRequest() {}

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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
