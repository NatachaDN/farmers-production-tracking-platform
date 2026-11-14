package com.farmer.tracking.modules.animal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public class AnimalProductionRequest {
    @NotBlank(message = "Production type is required")
    private String productionType;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Double quantity;

    @NotBlank(message = "Unit is required")
    private String unit;

    @NotNull(message = "Production date is required")
    private LocalDate productionDate;

    private String qualityGrade;
    private Double estimatedRevenue;
    private String notes;

    public String getProductionType() { return productionType; }
    public void setProductionType(String productionType) { this.productionType = productionType; }
    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public LocalDate getProductionDate() { return productionDate; }
    public void setProductionDate(LocalDate productionDate) { this.productionDate = productionDate; }
    public String getQualityGrade() { return qualityGrade; }
    public void setQualityGrade(String qualityGrade) { this.qualityGrade = qualityGrade; }
    public Double getEstimatedRevenue() { return estimatedRevenue; }
    public void setEstimatedRevenue(Double estimatedRevenue) { this.estimatedRevenue = estimatedRevenue; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}

