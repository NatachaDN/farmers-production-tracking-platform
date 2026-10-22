package com.farmer.tracking.modules.farm.controller;

import com.farmer.tracking.common.exception.GlobalExceptionHandler;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.farm.api.FarmRequest;
import com.farmer.tracking.modules.farm.api.FarmResponse;
import com.farmer.tracking.modules.farm.service.FarmService;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FarmController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class FarmControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FarmService farmService;

    @MockBean
    private com.farmer.tracking.common.security.JwtTokenProvider jwtTokenProvider;

    @MockBean
    private com.farmer.tracking.common.security.CustomUserDetailsService customUserDetailsService;

    private ObjectMapper objectMapper;
    private final Long farmerId = 1L;
    private final Long farmId = 10L;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("POST /api/v1/farmers/{farmerId}/farms creates farm and returns 201 Created")
    void createFarm_Success() throws Exception {
        FarmRequest request = new FarmRequest("Green Acres Farm", "Nakuru County, Kenya", "Main holding", true);

        FarmResponse response = new FarmResponse();
        response.setId(farmId);
        response.setFarmerId(farmerId);
        response.setName("Green Acres Farm");
        response.setLocation("Nakuru County, Kenya");
        response.setIsDefault(true);
        response.setTotalArea(8.7);
        response.setPlotCount(4);

        when(farmService.createFarm(eq(farmerId), any(FarmRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/farms", farmerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(farmId))
                .andExpect(jsonPath("$.name").value("Green Acres Farm"))
                .andExpect(jsonPath("$.isDefault").value(true));
    }

    @Test
    @DisplayName("PUT /api/v1/farmers/{farmerId}/farms/{farmId} updates farm and returns 200 OK")
    void updateFarm_Success() throws Exception {
        FarmRequest request = new FarmRequest("Green Acres Updated", "Nakuru West", "Updated description", true);

        FarmResponse response = new FarmResponse();
        response.setId(farmId);
        response.setFarmerId(farmerId);
        response.setName("Green Acres Updated");
        response.setLocation("Nakuru West");

        when(farmService.updateFarm(eq(farmerId), eq(farmId), any(FarmRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/farmers/{farmerId}/farms/{farmId}", farmerId, farmId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Green Acres Updated"))
                .andExpect(jsonPath("$.location").value("Nakuru West"));
    }

    @Test
    @DisplayName("POST /api/v1/farmers/{farmerId}/farms with blank name returns 400 Bad Request")
    void createFarm_ValidationError_Returns400() throws Exception {
        FarmRequest request = new FarmRequest("", "Location", "Desc", false);

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/farms", farmerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.name").exists());
    }

    @Test
    @DisplayName("GET /api/v1/farmers/{farmerId}/farms returns 200 OK with list of farms")
    void getFarms_Success() throws Exception {
        FarmResponse response = new FarmResponse();
        response.setId(farmId);
        response.setName("Green Acres Farm");

        when(farmService.getFarmsByFarmer(farmerId)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/farmers/{farmerId}/farms", farmerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(farmId))
                .andExpect(jsonPath("$[0].name").value("Green Acres Farm"));
    }
}
