package com.farmer.tracking.modules.animal.dto;

import com.farmer.tracking.modules.animal.model.AnimalProduction;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class AnimalProductionResponse {
    private Long id;
    private Long animalGroupId;
    private String animalGroupName;
    private String productionType;
    private Double quantity;
    private String unit;
    private LocalDate productionDate;
    private String qualityGrade;
    private Double estimatedRevenue;
    private String notes;
    private LocalDateTime createdAt;

    public static AnimalProductionResponse fromEntity(AnimalProduction p) {
        AnimalProductionResponse res = new AnimalProductionResponse();
        res.id = p.getId();
        res.animalGroupId = p.getAnimalGroup().getId();
        res.animalGroupName = p.getAnimalGroup().getName();
        res.productionType = p.getProductionType();
        res.quantity = p.getQuantity();
        res.unit = p.getUnit();
        res.productionDate = p.getProductionDate();
        res.qualityGrade = p.getQualityGrade();
        res.estimatedRevenue = p.getEstimatedRevenue();
        res.notes = p.getNotes();
        res.createdAt = p.getCreatedAt();
        return res;
    }

    public Long getId() { return id; }
    public Long getAnimalGroupId() { return animalGroupId; }
    public String getAnimalGroupName() { return animalGroupName; }
    public String getProductionType() { return productionType; }
    public Double getQuantity() { return quantity; }
    public String getUnit() { return unit; }
    public LocalDate getProductionDate() { return productionDate; }
    public String getQualityGrade() { return qualityGrade; }
    public Double getEstimatedRevenue() { return estimatedRevenue; }
    public String getNotes() { return notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

