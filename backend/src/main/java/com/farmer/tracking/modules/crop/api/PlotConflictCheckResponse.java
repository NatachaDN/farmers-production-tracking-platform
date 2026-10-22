package com.farmer.tracking.modules.crop.api;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response indicating whether a plot is occupied by an active cycle")
public class PlotConflictCheckResponse {

    @Schema(description = "True if the plot already has an active cycle", example = "true")
    private boolean hasConflict;

    @Schema(description = "ID of active cycle on this plot if conflict exists", example = "1")
    private Long activeCycleId;

    @Schema(description = "Name of active cycle", example = "Maize — Plot A")
    private String activeCycleName;

    @Schema(description = "Crop of active cycle", example = "Maize")
    private String activeCropName;

    @Schema(description = "Human-readable warning message")
    private String message;

    public PlotConflictCheckResponse() {}

    public PlotConflictCheckResponse(boolean hasConflict, Long activeCycleId, String activeCycleName, String activeCropName, String message) {
        this.hasConflict = hasConflict;
        this.activeCycleId = activeCycleId;
        this.activeCycleName = activeCycleName;
        this.activeCropName = activeCropName;
        this.message = message;
    }

    public static PlotConflictCheckResponse noConflict() {
        return new PlotConflictCheckResponse(false, null, null, null, "Plot is available for a new production cycle.");
    }

    public static PlotConflictCheckResponse conflict(Long cycleId, String cycleName, String cropName, String plotName) {
        String msg = String.format("Plot '%s' is already occupied by active cycle '%s' (%s).", plotName, cycleName, cropName);
        return new PlotConflictCheckResponse(true, cycleId, cycleName, cropName, msg);
    }

    public boolean isHasConflict() {
        return hasConflict;
    }

    public void setHasConflict(boolean hasConflict) {
        this.hasConflict = hasConflict;
    }

    public Long getActiveCycleId() {
        return activeCycleId;
    }

    public void setActiveCycleId(Long activeCycleId) {
        this.activeCycleId = activeCycleId;
    }

    public String getActiveCycleName() {
        return activeCycleName;
    }

    public void setActiveCycleName(String activeCycleName) {
        this.activeCycleName = activeCycleName;
    }

    public String getActiveCropName() {
        return activeCropName;
    }

    public void setActiveCropName(String activeCropName) {
        this.activeCropName = activeCropName;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
