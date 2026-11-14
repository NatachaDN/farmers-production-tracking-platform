package com.farmer.tracking.modules.input.api;

import com.farmer.tracking.modules.input.entity.FarmInput;
import com.farmer.tracking.modules.input.entity.InputType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class FarmInputResponse {

    private Long id;
    private Long farmerId;
    private String name;
    private InputType type;
    private Double quantity;
    private String unit;
    private LocalDate purchaseDate;
    private Double purchasePrice;
    private Double cumulativeCost;
    private String brand;
    private String supplier;
    private String batchNumber;
    private LocalDate expiryDate;
    private String storageLocation;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FarmInputResponse() {
    }

    public FarmInputResponse(Long id, Long farmerId, String name, InputType type, Double quantity, String unit,
            LocalDate purchaseDate, Double purchasePrice, Double cumulativeCost, LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = id;
        this.farmerId = farmerId;
        this.name = name;
        this.type = type;
        this.quantity = quantity;
        this.unit = unit;
        this.purchaseDate = purchaseDate;
        this.purchasePrice = purchasePrice;
        this.cumulativeCost = cumulativeCost;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static FarmInputResponse fromEntity(FarmInput input) {
        FarmInputResponse response = new FarmInputResponse(
                input.getId(),
                input.getFarmerId(),
                input.getName(),
                input.getType(),
                input.getQuantity(),
                input.getUnit(),
                input.getPurchaseDate(),
                input.getPurchasePrice(),
                input.getCumulativeCost(),
                input.getCreatedAt(),
                input.getUpdatedAt());
        response.setBrand(input.getBrand());
        response.setSupplier(input.getSupplier());
        response.setBatchNumber(input.getBatchNumber());
        response.setExpiryDate(input.getExpiryDate());
        response.setStorageLocation(input.getStorageLocation());
        response.setDescription(input.getDescription());
        return response;
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

    public InputType getType() {
        return type;
    }

    public void setType(InputType type) {
        this.type = type;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public Double getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(Double purchasePrice) {
        this.purchasePrice = purchasePrice;
    }

    public Double getCumulativeCost() {
        return cumulativeCost;
    }

    public void setCumulativeCost(Double cumulativeCost) {
        this.cumulativeCost = cumulativeCost;
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

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getSupplier() {
        return supplier;
    }

    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }

    public String getBatchNumber() {
        return batchNumber;
    }

    public void setBatchNumber(String batchNumber) {
        this.batchNumber = batchNumber;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getStorageLocation() {
        return storageLocation;
    }

    public void setStorageLocation(String storageLocation) {
        this.storageLocation = storageLocation;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
