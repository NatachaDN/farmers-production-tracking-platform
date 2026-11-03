package com.farmer.tracking.modules.crop.api;

import com.farmer.tracking.modules.crop.entity.CycleInputUsage;
import com.farmer.tracking.modules.input.entity.InputType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(description = "Response representing an input consumption record linked to a production cycle")
public class CycleInputUsageResponse {

    @Schema(description = "Consumption record ID", example = "1")
    private Long id;

    @Schema(description = "Production cycle ID", example = "5")
    private Long cycleId;

    @Schema(description = "Farm input ID", example = "2")
    private Long inputId;

    @Schema(description = "Farmer ID", example = "1")
    private Long farmerId;

    @Schema(description = "Name of the input", example = "CAN Fertilizer")
    private String inputName;

    @Schema(description = "Input category type", example = "FERTILIZER")
    private InputType inputType;

    @Schema(description = "Quantity consumed on this cycle", example = "50.0")
    private Double quantityUsed;

    @Schema(description = "Unit of measurement", example = "kg")
    private String unit;

    @Schema(description = "Cost per unit applied", example = "160.0")
    private Double unitPrice;

    @Schema(description = "Total real cost for this consumption (quantityUsed * unitPrice)", example = "8000.0")
    private Double totalCost;

    @Schema(description = "Remaining available stock in inventory after this deduction", example = "150.0")
    private Double remainingStock;

    @Schema(description = "Date when input was applied", example = "2026-10-15")
    private LocalDate usageDate;

    @Schema(description = "Application notes", example = "Top-dressing at vegetative stage")
    private String notes;

    @Schema(description = "Record creation timestamp")
    private LocalDateTime createdAt;

    public CycleInputUsageResponse() {}

    public CycleInputUsageResponse(Long id, Long cycleId, Long inputId, Long farmerId,
                                   String inputName, InputType inputType, Double quantityUsed,
                                   String unit, Double unitPrice, Double totalCost,
                                   Double remainingStock, LocalDate usageDate, String notes,
                                   LocalDateTime createdAt) {
        this.id = id;
        this.cycleId = cycleId;
        this.inputId = inputId;
        this.farmerId = farmerId;
        this.inputName = inputName;
        this.inputType = inputType;
        this.quantityUsed = quantityUsed;
        this.unit = unit;
        this.unitPrice = unitPrice;
        this.totalCost = totalCost;
        this.remainingStock = remainingStock;
        this.usageDate = usageDate;
        this.notes = notes;
        this.createdAt = createdAt;
    }

    public static CycleInputUsageResponse fromEntity(CycleInputUsage usage, Double remainingStock) {
        if (usage == null) return null;
        return new CycleInputUsageResponse(
                usage.getId(),
                usage.getCycle() != null ? usage.getCycle().getId() : null,
                usage.getFarmInput() != null ? usage.getFarmInput().getId() : null,
                usage.getFarmerId(),
                usage.getInputName(),
                usage.getInputType(),
                usage.getQuantityUsed(),
                usage.getUnit(),
                usage.getUnitPrice(),
                usage.getTotalCost(),
                remainingStock != null ? remainingStock : (usage.getFarmInput() != null ? usage.getFarmInput().getQuantity() : null),
                usage.getUsageDate(),
                usage.getNotes(),
                usage.getCreatedAt()
        );
    }

    public static CycleInputUsageResponse fromEntity(CycleInputUsage usage) {
        return fromEntity(usage, null);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCycleId() {
        return cycleId;
    }

    public void setCycleId(Long cycleId) {
        this.cycleId = cycleId;
    }

    public Long getInputId() {
        return inputId;
    }

    public void setInputId(Long inputId) {
        this.inputId = inputId;
    }

    public Long getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(Long farmerId) {
        this.farmerId = farmerId;
    }

    public String getInputName() {
        return inputName;
    }

    public void setInputName(String inputName) {
        this.inputName = inputName;
    }

    public InputType getInputType() {
        return inputType;
    }

    public void setInputType(InputType inputType) {
        this.inputType = inputType;
    }

    public Double getQuantityUsed() {
        return quantityUsed;
    }

    public void setQuantityUsed(Double quantityUsed) {
        this.quantityUsed = quantityUsed;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Double getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(Double totalCost) {
        this.totalCost = totalCost;
    }

    public Double getRemainingStock() {
        return remainingStock;
    }

    public void setRemainingStock(Double remainingStock) {
        this.remainingStock = remainingStock;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
