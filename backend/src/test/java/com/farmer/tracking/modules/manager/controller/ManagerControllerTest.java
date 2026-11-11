package com.farmer.tracking.modules.manager.controller;

import com.farmer.tracking.common.exception.GlobalExceptionHandler;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.security.CustomUserDetailsService;
import com.farmer.tracking.common.security.JwtAuthenticationFilter;
import com.farmer.tracking.common.security.JwtTokenProvider;
import com.farmer.tracking.modules.auth.model.FarmType;
import com.farmer.tracking.modules.auth.model.RegistrationStatus;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.manager.dto.ManagerDtos.*;
import com.farmer.tracking.modules.manager.service.ManagerService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ManagerController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class ManagerControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockBean
        private ManagerService managerService;

        // Security infrastructure mocks required by WebMvcTest
        @MockBean
        private JwtTokenProvider jwtTokenProvider;

        @MockBean
        private JwtAuthenticationFilter jwtAuthenticationFilter;

        @MockBean
        private CustomUserDetailsService customUserDetailsService;

        @MockBean
        private FarmerRepository farmerRepository;

        @Test
        @DisplayName("GET /api/v1/manager/dashboard returns aggregated summary (US-33)")
        void getDashboardSummary_ReturnsSuccess() throws Exception {
                ManagerDashboardSummary mockSummary = new ManagerDashboardSummary(
                                10L, 2L, 7L, 1L,
                                8, 14,
                                24500.0, 24.5, 45.2,
                                15, 6, 85L,
                                2,
                                List.of(), List.of(), List.of(), List.of());

                when(managerService.getDashboardSummary()).thenReturn(mockSummary);

                mockMvc.perform(get("/api/v1/manager/dashboard"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.totalFarmers").value(10))
                                .andExpect(jsonPath("$.pendingFarmers").value(2))
                                .andExpect(jsonPath("$.activeCyclesCount").value(8))
                                .andExpect(jsonPath("$.totalHarvestKg").value(24500.0))
                                .andExpect(jsonPath("$.totalHarvestTons").value(24.5));
        }

        @Test
        @DisplayName("GET /api/v1/manager/farmers returns farmer list with filter params (US-31, US-32)")
        void getFarmers_ReturnsFarmerList() throws Exception {
                ManagerFarmerRow row = new ManagerFarmerRow(
                                1L, "Joyce Muthoni", "joyce@example.com", "Nakuru", "Rift Valley",
                                "Green Valley", FarmType.CROP, List.of("Maize", "Beans"),
                                3, 2, 5, 4500.0, 4.5,
                                RegistrationStatus.APPROVED, null,
                                LocalDateTime.now().minusMonths(6), null);

                when(managerService.getFarmers(any(), any(), any(), any(), any())).thenReturn(List.of(row));

                mockMvc.perform(get("/api/v1/manager/farmers")
                                .param("search", "Joyce")
                                .param("region", "Rift Valley")
                                .param("crop", "Maize")
                                .param("status", "APPROVED")
                                .param("sort", "name"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].id").value(1))
                                .andExpect(jsonPath("$[0].fullName").value("Joyce Muthoni"))
                                .andExpect(jsonPath("$[0].plotsCount").value(3))
                                .andExpect(jsonPath("$[0].activeCycles").value(2))
                                .andExpect(jsonPath("$[0].harvestedKg").value(4500.0));
        }

        @Test
        @DisplayName("GET /api/v1/manager/farmers/{id} returns drilldown detail (US-33)")
        void getFarmerDetail_ReturnsDetail() throws Exception {
                ManagerFarmerRow row = new ManagerFarmerRow(
                                1L, "Joyce Muthoni", "joyce@example.com", "Nakuru", "Rift Valley",
                                "Green Valley", FarmType.CROP, List.of("Maize"),
                                1, 1, 1, 2000.0, 2.0,
                                RegistrationStatus.APPROVED, null,
                                LocalDateTime.now(), null);
                ManagerFarmerDetail detail = new ManagerFarmerDetail(
                                row, List.of(), List.of(), List.of(), List.of(), List.of(), List.of());

                when(managerService.getFarmerDetail(1L)).thenReturn(detail);

                mockMvc.perform(get("/api/v1/manager/farmers/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.farmer.fullName").value("Joyce Muthoni"));
        }

        @Test
        @DisplayName("GET /api/v1/manager/farmers/{id} returns 404 when not found")
        void getFarmerDetail_NotFound() throws Exception {
                when(managerService.getFarmerDetail(999L)).thenThrow(new ResourceNotFoundException("Farmer not found"));

                mockMvc.perform(get("/api/v1/manager/farmers/999"))
                                .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("PUT /api/v1/manager/farmers/{id}/status approves farmer (US-34)")
        void updateFarmerStatus_Approve() throws Exception {
                UpdateFarmerStatusRequest req = new UpdateFarmerStatusRequest(RegistrationStatus.APPROVED, null);
                ManagerFarmerRow row = new ManagerFarmerRow(
                                2L, "Kofi Mensah", "kofi@example.com", "Sunyani", "Bono",
                                "Sunyani Farm", FarmType.MIXED, List.of(),
                                0, 0, 0, 0.0, 0.0,
                                RegistrationStatus.APPROVED, null,
                                LocalDateTime.now(), null);

                when(managerService.updateFarmerStatus(eq(2L), any(), any())).thenReturn(row);

                mockMvc.perform(put("/api/v1/manager/farmers/2/status")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.status").value("APPROVED"));
        }

        @Test
        @DisplayName("POST /api/v1/manager/reports/consolidated generates report (US-35)")
        void generateConsolidatedReport_ReturnsReport() throws Exception {
                ConsolidatedReportRequest req = new ConsolidatedReportRequest(
                                LocalDate.of(2026, 1, 1),
                                LocalDate.of(2026, 6, 30),
                                List.of(1L, 2L),
                                null,
                                null);
                ConsolidatedReportResponse report = new ConsolidatedReportResponse(
                                "REP-2026-TEST",
                                LocalDateTime.now(),
                                LocalDate.of(2026, 1, 1),
                                LocalDate.of(2026, 6, 30),
                                2,
                                15000.0, 15.0,
                                4, 3,
                                5, 32.5,
                                0, 1200.0,
                                List.of(), List.of());

                when(managerService.generateConsolidatedReport(any())).thenReturn(report);

                mockMvc.perform(post("/api/v1/manager/reports/consolidated")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.totalFarmersCount").value(2))
                                .andExpect(jsonPath("$.totalYieldKg").value(15000.0));
        }

        @Test
        @DisplayName("POST /api/v1/manager/reports/consolidated/export exports CSV (US-35)")
        void exportConsolidatedReportCsv_ReturnsCsv() throws Exception {
                ConsolidatedReportRequest req = new ConsolidatedReportRequest(
                                LocalDate.of(2026, 1, 1),
                                LocalDate.of(2026, 6, 30),
                                List.of(1L),
                                null,
                                null);

                when(managerService.exportConsolidatedReportCsv(any()))
                                .thenReturn("Period Start,Period End\n2026-01-01,2026-06-30\n");

                mockMvc.perform(post("/api/v1/manager/reports/consolidated/export")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req)))
                                .andExpect(status().isOk())
                                .andExpect(header().string("Content-Disposition",
                                                "attachment; filename=\"consolidated-production-report.csv\""))
                                .andExpect(content().contentType("text/csv;charset=UTF-8"))
                                .andExpect(content().string(
                                                org.hamcrest.Matchers.containsString("Period Start,Period End")));
        }
}
