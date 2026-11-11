package com.farmer.tracking.modules.crop.api;

import jakarta.validation.constraints.*;

public class HarvestCorrectionRequest extends HarvestRequest {
    @NotNull @PositiveOrZero private Long expectedRevision;
    @NotBlank @Size(max = 1000) private String reason;
    public Long getExpectedRevision() { return expectedRevision; }
    public void setExpectedRevision(Long value) { expectedRevision = value; }
    public String getReason() { return reason; }
    public void setReason(String value) { reason = value; }
}
