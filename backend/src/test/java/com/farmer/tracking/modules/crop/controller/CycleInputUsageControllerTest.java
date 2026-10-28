package com.farmer.tracking.modules.crop.controller;

import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.exception.GlobalExceptionHandler;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.crop.api.CycleCostSummaryResponse;
import com.farmer.tracking.modules.crop.api.CycleInputUsageRequest;
import com.farmer.tracking.modules.crop.api.CycleInputUsageResponse;
import com.farmer.tracking.modules.crop.service.CycleInputUsageService;
import com.farmer.tracking.modules.input.entity.InputType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
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
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CycleInputUsageController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class CycleInputUsageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CycleInputUsageService cycleInputUsageService;

    @MockBean
    private com.farmer.tracking.common.security.JwtTokenProvider jwtTokenProvider;

    @MockBean
    private com.farmer.tracking.common.security.CustomUserDetailsService customUserDetailsService;

    private ObjectMapper objectMapper;
    private final Long farmerId = 1L;
    private final Long cycleId = 5L;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Test
    @DisplayName("POST /api/v1/farmers/{farmerId}/cycles/{cycleId}/inputs - Success 201 Created")
    void recordInputUsage_Success() throws Exception {
        CycleInputUsageRequest request = new CycleInputUsageRequest(2L, 50.0, LocalDate.of(2026, 10, 15), "Applied fertilizer");

        CycleInputUsageResponse response = new CycleInputUsageResponse(
                100L, cycleId, 2L, farmerId, "CAN Fertilizer", InputType.FERTILIZER,
                50.0, "kg", 160.0, 8000.0, 150.0, LocalDate.of(2026, 10, 15),
                "Applied fertilizer", LocalDateTime.now()
        );

        when(cycleInputUsageService.recordInputUsage(eq(farmerId), eq(cycleId), any(CycleInputUsageRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/cycles/{cycleId}/inputs", farmerId, cycleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100L))
                .andExpect(jsonPath("$.inputName").value("CAN Fertilizer"))
                .andExpect(jsonPath("$.quantityUsed").value(50.0))
                .andExpect(jsonPath("$.totalCost").value(8000.0))
                .andExpect(jsonPath("$.remainingStock").value(150.0));
    }

    @Test
    @DisplayName("POST /api/v1/farmers/{farmerId}/cycles/{cycleId}/inputs - 400 when insufficient stock")
    void recordInputUsage_InsufficientStock_400() throws Exception {
        CycleInputUsageRequest request = new CycleInputUsageRequest(2L, 500.0, LocalDate.now(), null);

        when(cycleInputUsageService.recordInputUsage(eq(farmerId), eq(cycleId), any(CycleInputUsageRequest.class)))
                .thenThrow(new BadRequestException("Insufficient stock. Available stock for 'CAN Fertilizer' is 200.00 kg, but 500.00 kg was requested."));

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/cycles/{cycleId}/inputs", farmerId, cycleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Insufficient stock. Available stock for 'CAN Fertilizer' is 200.00 kg, but 500.00 kg was requested."));
    }

    @Test
    @DisplayName("POST /api/v1/farmers/{farmerId}/cycles/{cycleId}/inputs - 400 when cycle not active")
    void recordInputUsage_CycleNotActive_400() throws Exception {
        CycleInputUsageRequest request = new CycleInputUsageRequest(2L, 10.0, LocalDate.now(), null);

        when(cycleInputUsageService.recordInputUsage(eq(farmerId), eq(cycleId), any(CycleInputUsageRequest.class)))
                .thenThrow(new IllegalArgumentException("Input consumption can only be recorded for an ACTIVE cycle. Current status is: COMPLETED"));

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/cycles/{cycleId}/inputs", farmerId, cycleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Input consumption can only be recorded for an ACTIVE cycle. Current status is: COMPLETED"));
    }

    @Test
    @DisplayName("GET /api/v1/farmers/{farmerId}/cycles/{cycleId}/inputs - 200 OK")
    void getInputsByCycle_Success() throws Exception {
        CycleInputUsageResponse r1 = new CycleInputUsageResponse(
                1L, cycleId, 2L, farmerId, "CAN Fertilizer", InputType.FERTILIZER,
                50.0, "kg", 160.0, 8000.0, 150.0, LocalDate.now(), null, LocalDateTime.now()
        );

        when(cycleInputUsageService.getInputsByCycle(farmerId, cycleId)).thenReturn(List.of(r1));

        mockMvc.perform(get("/api/v1/farmers/{farmerId}/cycles/{cycleId}/inputs", farmerId, cycleId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].inputName").value("CAN Fertilizer"));
    }

    @Test
    @DisplayName("GET /api/v1/farmers/{farmerId}/cycles/{cycleId}/inputs/summary - 200 OK")
    void getCycleCostSummary_Success() throws Exception {
        CycleCostSummaryResponse summary = new CycleCostSummaryResponse(
                cycleId, "Maize — Plot A", "Maize", 8000.0, 1, Map.of("FERTILIZER", 8000.0), List.of()
        );

        when(cycleInputUsageService.getCycleCostSummary(farmerId, cycleId)).thenReturn(summary);

        mockMvc.perform(get("/api/v1/farmers/{farmerId}/cycles/{cycleId}/inputs/summary", farmerId, cycleId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cycleId").value(cycleId))
                .andExpect(jsonPath("$.totalInputCost").value(8000.0))
                .andExpect(jsonPath("$.inputCount").value(1));
    }

    @Test
    @DisplayName("DELETE /api/v1/farmers/{farmerId}/cycles/{cycleId}/inputs/{usageId} - 204 No Content")
    void deleteInputUsage_Success() throws Exception {
        doNothing().when(cycleInputUsageService).deleteInputUsage(farmerId, cycleId, 1L);

        mockMvc.perform(delete("/api/v1/farmers/{farmerId}/cycles/{cycleId}/inputs/{usageId}", farmerId, cycleId, 1L))
                .andExpect(status().isNoContent());

        verify(cycleInputUsageService).deleteInputUsage(farmerId, cycleId, 1L);
    }
}
