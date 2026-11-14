package com.farmer.tracking.modules.manager.service;

import com.farmer.tracking.modules.auth.model.RegistrationStatus;
import com.farmer.tracking.modules.manager.dto.ManagerDtos.*;

import java.util.List;

public interface ManagerService {

    /**
     * Aggregated indicators across all farmers (US-33): total yield, active cycles, alerts, top producers.
     */
    ManagerDashboardSummary getDashboardSummary();

    /**
     * List of all registered farmers sortable and filterable by region, crop, or status (US-31, US-32).
     */
    List<ManagerFarmerRow> getFarmers(String search, String region, String crop, RegistrationStatus status, String sort);

    /**
     * Drill down into a specific farmer's farms, plots, cycles, harvests, incidents, and livestock (US-33).
     */
    ManagerFarmerDetail getFarmerDetail(Long farmerId);

    /**
     * Approve or reject a farmer's registration status (US-34).
     */
    ManagerFarmerRow updateFarmerStatus(Long farmerId, UpdateFarmerStatusRequest request, String managerEmail);

    /**
     * Consolidated multi-farmer production report over a given period (US-35).
     */
    ConsolidatedReportResponse generateConsolidatedReport(ConsolidatedReportRequest request);

    /**
     * Export consolidated multi-farmer production report as formatted CSV (US-35).
     */
    String exportConsolidatedReportCsv(ConsolidatedReportRequest request);

    /**
     * Aggregated view of all crop cycles, harvest records, and livestock groups across supervised farmers.
     */
    ManagerProductionsResponse getSupervisedProductions(String search, Long farmerId, String status);
}
