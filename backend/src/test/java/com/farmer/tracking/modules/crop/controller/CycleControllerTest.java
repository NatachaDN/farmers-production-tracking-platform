package com.farmer.tracking.modules.crop.controller;

import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.GlobalExceptionHandler;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.crop.api.CycleRequest;
import com.farmer.tracking.modules.crop.api.CycleResponse;
import com.farmer.tracking.modules.crop.api.PlotConflictCheckResponse;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.service.CycleService;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CycleController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class CycleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CycleService cycleService;

    @MockBean
    private com.farmer.tracking.common.security.JwtTokenProvider jwtTokenProvider;

    @MockBean
    private com.farmer.tracking.common.security.CustomUserDetailsService customUserDetailsService;

    private ObjectMapper objectMapper;
    private final Long farmerId = 1L;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Test
    @DisplayName("POST /api/v1/farmers/{farmerId}/cycles - Success 201 Created")
    void createCycle_Success() throws Exception {
        CycleRequest request = new CycleRequest();
        request.setPlotId(5L);
        request.setCropName("Maize");
        request.setPlantingDate(LocalDate.of(2026, 10, 10));
        request.setPlannedHarvestDate(LocalDate.of(2027, 2, 15));
        request.setExpectedQuantity(5000.0);
        request.setExpectedQuantityUnit("kg");

        CycleResponse response = new CycleResponse();
        response.setId(10L);
        response.setFarmerId(farmerId);
        response.setPlotId(5L);
        response.setPlotName("Plot A");
        response.setCropName("Maize");
        response.setName("Maize — Plot A");
        response.setStatus(CycleStatus.ACTIVE);
        response.setPlantingDate(request.getPlantingDate());
        response.setPlannedHarvestDate(request.getPlannedHarvestDate());
        response.setExpectedQuantity(5000.0);
        response.setExpectedQuantityUnit("kg");

        when(cycleService.createCycle(eq(farmerId), any(CycleRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/cycles", farmerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.cropName").value("Maize"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.expectedQuantity").value(5000.0))
                .andExpect(jsonPath("$.expectedQuantityUnit").value("kg"));
    }

    @Test
    @DisplayName("POST /api/v1/farmers/{farmerId}/cycles - Returns 409 Conflict when plot occupied")
    void createCycle_PlotConflict_Returns409() throws Exception {
        CycleRequest request = new CycleRequest();
        request.setPlotId(5L);
        request.setCropName("Beans");
        request.setPlantingDate(LocalDate.of(2026, 10, 10));

        when(cycleService.createCycle(eq(farmerId), any(CycleRequest.class)))
                .thenThrow(new ConflictException("Plot 'Plot A' already has an active cycle 'Maize — Plot A'."));

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/cycles", farmerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("already has an active cycle")));
    }

    @Test
    @DisplayName("POST /api/v1/farmers/{farmerId}/cycles - Returns 400 Bad Request on missing fields")
    void createCycle_ValidationError_Returns400() throws Exception {
        CycleRequest request = new CycleRequest();
        // Missing plotId, cropName, plantingDate

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/cycles", farmerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.plotId").exists())
                .andExpect(jsonPath("$.validationErrors.cropName").exists())
                .andExpect(jsonPath("$.validationErrors.plantingDate").exists());
    }

    @Test
    @DisplayName("GET /api/v1/farmers/{farmerId}/cycles - Success 200 OK")
    void getCycles_Success() throws Exception {
        CycleResponse c1 = new CycleResponse();
        c1.setId(1L);
        c1.setCropName("Maize");
        c1.setStatus(CycleStatus.ACTIVE);

        when(cycleService.getCyclesByFarmer(eq(farmerId), any())).thenReturn(List.of(c1));

        mockMvc.perform(get("/api/v1/farmers/{farmerId}/cycles", farmerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].cropName").value("Maize"));
    }

    @Test
    @DisplayName("GET /api/v1/farmers/{farmerId}/cycles/check-plot/{plotId} - Success 200 OK")
    void checkPlotAvailability_Success() throws Exception {
        PlotConflictCheckResponse check = PlotConflictCheckResponse.conflict(1L, "Maize Cycle", "Maize", "Plot A");
        when(cycleService.checkPlotAvailability(farmerId, 5L)).thenReturn(check);

        mockMvc.perform(get("/api/v1/farmers/{farmerId}/cycles/check-plot/{plotId}", farmerId, 5L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasConflict").value(true))
                .andExpect(jsonPath("$.activeCycleId").value(1))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("already occupied")));
    }
}
