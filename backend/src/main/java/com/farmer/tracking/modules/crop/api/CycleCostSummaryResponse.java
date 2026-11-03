package com.farmer.tracking.modules.crop.api;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.Map;

@Schema(description = "Summary of real input consumption and financial cost for a crop production cycle")
public class CycleCostSummaryResponse {

    @Schema(description = "Production cycle ID", example = "1")
    private Long cycleId;

    @Schema(description = "Cycle name", example = "Maize — Plot A")
    private String cycleName;

    @Schema(description = "Crop grown", example = "Maize")
    private String cropName;

    @Schema(description = "Total real cost of inputs consumed on this cycle", example = "45000.0")
    private Double totalInputCost;

    @Schema(description = "Number of distinct input applications recorded", example = "3")
    private Integer inputCount;

    @Schema(description = "Cost breakdown by input type (e.g. SEEDS, FERTILIZER, PESTICIDE)")
    private Map<String, Double> costByType;

    @Schema(description = "Detailed list of inputs consumed on this cycle")
    private List<CycleInputUsageResponse> items;

    public CycleCostSummaryResponse() {}

    public CycleCostSummaryResponse(Long cycleId, String cycleName, String cropName,
                                    Double totalInputCost, Integer inputCount,
                                    Map<String, Double> costByType, List<CycleInputUsageResponse> items) {
        this.cycleId = cycleId;
        this.cycleName = cycleName;
        this.cropName = cropName;
        this.totalInputCost = totalInputCost;
        this.inputCount = inputCount;
        this.costByType = costByType;
        this.items = items;
    }

    public Long getCycleId() {
        return cycleId;
    }

    public void setCycleId(Long cycleId) {
        this.cycleId = cycleId;
    }

    public String getCycleName() {
        return cycleName;
    }

    public void setCycleName(String cycleName) {
        this.cycleName = cycleName;
    }

    public String getCropName() {
        return cropName;
    }

    public void setCropName(String cropName) {
        this.cropName = cropName;
    }

    public Double getTotalInputCost() {
        return totalInputCost;
    }

    public void setTotalInputCost(Double totalInputCost) {
        this.totalInputCost = totalInputCost;
    }

    public Integer getInputCount() {
        return inputCount;
    }

    public void setInputCount(Integer inputCount) {
        this.inputCount = inputCount;
    }

    public Map<String, Double> getCostByType() {
        return costByType;
    }

    public void setCostByType(Map<String, Double> costByType) {
        this.costByType = costByType;
    }

    public List<CycleInputUsageResponse> getItems() {
        return items;
    }

    public void setItems(List<CycleInputUsageResponse> items) {
        this.items = items;
    }
}
