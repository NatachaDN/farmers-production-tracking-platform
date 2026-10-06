package com.farmer.tracking.modules.crop.controller;

import com.farmer.tracking.common.exception.GlobalExceptionHandler;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.crop.api.HarvestRequest;
import com.farmer.tracking.modules.crop.api.HarvestResponse;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.entity.HarvestUnit;
import com.farmer.tracking.modules.crop.service.HarvestService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(HarvestController.class)
@Import(GlobalExceptionHandler.class)
class HarvestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private HarvestService harvestService;

    private ObjectMapper objectMapper;

    private final Long farmerId  = 1L;
    private final Long cycleId   = 10L;
    private final Long harvestId = 100L;
    private HarvestResponse sampleResponse;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        sampleResponse = new HarvestResponse(
                harvestId, cycleId, "Maize Season 2026", CycleStatus.COMPLETED,
                500.0, HarvestUnit.KG, LocalDate.of(2026, 6, 1),
                2.5, 200.0, "200.00 kg / ha",
                "Good season.", LocalDateTime.now(), LocalDateTime.now()
        );
    }

    // ------------------------------------------------------------------ //
    //  POST — record harvest                                              //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("POST records harvest and returns 201 Created")
    void shouldRecordHarvestAndReturn201() throws Exception {
        HarvestRequest request = new HarvestRequest(
                500.0, HarvestUnit.KG, LocalDate.of(2026, 6, 1), "Good season.");

        when(harvestService.recordHarvest(eq(farmerId), eq(cycleId), any(HarvestRequest.class)))
                .thenReturn(sampleResponse);

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/cycles/{cycleId}/harvest",
                        farmerId, cycleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(harvestId))
                .andExpect(jsonPath("$.cycleStatus").value("COMPLETED"))
                .andExpect(jsonPath("$.quantity").value(500.0))
                .andExpect(jsonPath("$.unit").value("KG"))
                .andExpect(jsonPath("$.yieldDisplay").value("200.00 kg / ha"));
    }

    @Test
    @DisplayName("POST with null quantity returns 400 Bad Request with field errors")
    void shouldReturn400WhenQuantityMissing() throws Exception {
        HarvestRequest invalidRequest = new HarvestRequest(
                null,                       // missing quantity
                HarvestUnit.KG,
                LocalDate.now(),
                null
        );

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/cycles/{cycleId}/harvest",
                        farmerId, cycleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.quantity").exists());
    }

    @Test
    @DisplayName("POST with null unit returns 400 Bad Request with field errors")
    void shouldReturn400WhenUnitMissing() throws Exception {
        HarvestRequest invalidRequest = new HarvestRequest(
                100.0,
                null,   // missing unit
                LocalDate.now(),
                null
        );

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/cycles/{cycleId}/harvest",
                        farmerId, cycleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.unit").exists());
    }

    @Test
    @DisplayName("POST returns 400 when cycle is not ACTIVE")
    void shouldReturn400WhenCycleNotActive() throws Exception {
        HarvestRequest request = new HarvestRequest(
                100.0, HarvestUnit.KG, LocalDate.now(), null);

        when(harvestService.recordHarvest(eq(farmerId), eq(cycleId), any(HarvestRequest.class)))
                .thenThrow(new IllegalStateException(
                        "Harvest can only be recorded for an ACTIVE cycle. Current status is: COMPLETED"));

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/cycles/{cycleId}/harvest",
                        farmerId, cycleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value(
                        "Harvest can only be recorded for an ACTIVE cycle. Current status is: COMPLETED"));
    }

    @Test
    @DisplayName("POST returns 404 when cycle not found for farmer")
    void shouldReturn404WhenCycleNotFound() throws Exception {
        HarvestRequest request = new HarvestRequest(
                100.0, HarvestUnit.KG, LocalDate.now(), null);

        when(harvestService.recordHarvest(eq(farmerId), eq(999L), any(HarvestRequest.class)))
                .thenThrow(new ResourceNotFoundException("Cycle not found with id: 999 for farmer: 1"));

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/cycles/{cycleId}/harvest",
                        farmerId, 999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Cycle not found with id: 999 for farmer: 1"));
    }

    // ------------------------------------------------------------------ //
    //  GET — retrieve harvest                                             //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("GET returns 200 with harvest record for completed cycle")
    void shouldReturnHarvestRecord() throws Exception {
        when(harvestService.getHarvestByCycle(farmerId, cycleId))
                .thenReturn(sampleResponse);

        mockMvc.perform(get("/api/v1/farmers/{farmerId}/cycles/{cycleId}/harvest",
                        farmerId, cycleId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(harvestId))
                .andExpect(jsonPath("$.cycleId").value(cycleId))
                .andExpect(jsonPath("$.quantity").value(500.0))
                .andExpect(jsonPath("$.unit").value("KG"))
                .andExpect(jsonPath("$.calculatedYield").value(200.0))
                .andExpect(jsonPath("$.yieldDisplay").value("200.00 kg / ha"))
                .andExpect(jsonPath("$.notes").value("Good season."));
    }

    @Test
    @DisplayName("GET returns 404 when no harvest exists for cycle")
    void shouldReturn404WhenHarvestNotFound() throws Exception {
        when(harvestService.getHarvestByCycle(farmerId, cycleId))
                .thenThrow(new ResourceNotFoundException("No harvest record found for cycle id: 10"));

        mockMvc.perform(get("/api/v1/farmers/{farmerId}/cycles/{cycleId}/harvest",
                        farmerId, cycleId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("No harvest record found for cycle id: 10"));
    }
}
