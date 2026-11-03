package com.farmer.tracking.modules.sale.api;

import java.math.BigDecimal;

/**
 * Margin calculation result for a production cycle:
 * margin = total sales revenue - associated expenses (input costs, labor, transport).
 */
public class MarginResponse {

    private Long cycleId;
    private String cycleName;
    private BigDecimal totalRevenue;
    private BigDecimal totalExpenses;
    private BigDecimal margin;

    public MarginResponse() {}

    public MarginResponse(Long cycleId, String cycleName, BigDecimal totalRevenue,
                          BigDecimal totalExpenses, BigDecimal margin) {
        this.cycleId = cycleId;
        this.cycleName = cycleName;
        this.totalRevenue = totalRevenue;
        this.totalExpenses = totalExpenses;
        this.margin = margin;
    }

    public Long getCycleId() { return cycleId; }
    public void setCycleId(Long cycleId) { this.cycleId = cycleId; }

    public String getCycleName() { return cycleName; }
    public void setCycleName(String cycleName) { this.cycleName = cycleName; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public BigDecimal getTotalExpenses() { return totalExpenses; }
    public void setTotalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; }

    public BigDecimal getMargin() { return margin; }
    public void setMargin(BigDecimal margin) { this.margin = margin; }
}
