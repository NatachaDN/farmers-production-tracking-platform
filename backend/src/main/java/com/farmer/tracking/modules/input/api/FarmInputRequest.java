package com.farmer.tracking.modules.input.api;

import com.farmer.tracking.modules.input.entity.InputType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public class FarmInputRequest {

    @NotBlank(message = "Input name is required")
    private String name;

    @NotNull(message = "Input type is required")
    private InputType type;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be a positive number")
    private Double quantity;

    @NotBlank(message = "Unit is required")
    private String unit;

    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;

    @NotNull(message = "Purchase price is required")
    @Positive(message = "Purchase price must be a positive number")
    private Double purchasePrice;

    public FarmInputRequest() {}

    public FarmInputRequest(String name, InputType type, Double quantity, String unit, LocalDate purchaseDate, Double purchasePrice) {
        this.name = name;
        this.type = type;
        this.quantity = quantity;
        this.unit = unit;
        this.purchaseDate = purchaseDate;
        this.purchasePrice = purchasePrice;
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
}
