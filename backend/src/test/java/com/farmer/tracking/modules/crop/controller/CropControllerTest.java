package com.farmer.tracking.modules.crop.controller;

import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.GlobalExceptionHandler;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.crop.api.CropRequest;
import com.farmer.tracking.modules.crop.api.CropResponse;
import com.farmer.tracking.modules.crop.service.CropService;
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

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CropController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class CropControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CropService cropService;

    @MockBean
    private com.farmer.tracking.common.security.JwtTokenProvider jwtTokenProvider;

    @MockBean
    private com.farmer.tracking.common.security.CustomUserDetailsService customUserDetailsService;

    private ObjectMapper objectMapper;
    private final Long farmerId = 1L;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("POST /api/v1/farmers/{farmerId}/crops - Success 201 Created")
    void registerCrop_Success() throws Exception {
        CropRequest request = new CropRequest("Maize", "Hybrid 614");
        CropResponse response = new CropResponse(1L, farmerId, "Maize", "Hybrid 614", LocalDateTime.now(), LocalDateTime.now());

        when(cropService.registerCrop(eq(farmerId), any(CropRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/crops", farmerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Maize"))
                .andExpect(jsonPath("$.variety").value("Hybrid 614"))
                .andExpect(jsonPath("$.displayName").value("Maize (Hybrid 614)"));
    }

    @Test
    @DisplayName("POST /api/v1/farmers/{farmerId}/crops - 400 Validation Error on blank name")
    void registerCrop_ValidationFails_BlankName() throws Exception {
        CropRequest request = new CropRequest("", "Hybrid 614");

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/crops", farmerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.name").value("Crop name is required"));
    }

    @Test
    @DisplayName("POST /api/v1/farmers/{farmerId}/crops - 409 Conflict on duplicate crop")
    void registerCrop_Conflict_Duplicate() throws Exception {
        CropRequest request = new CropRequest("Maize", "Hybrid 614");

        when(cropService.registerCrop(eq(farmerId), any(CropRequest.class)))
                .thenThrow(new ConflictException("Crop 'Maize' (Hybrid 614) is already in your personal crops list."));

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/crops", farmerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Crop 'Maize' (Hybrid 614) is already in your personal crops list."));
    }

    @Test
    @DisplayName("GET /api/v1/farmers/{farmerId}/crops - Success 200 Returns crop list")
    void getCrops_Success() throws Exception {
        CropResponse c1 = new CropResponse(1L, farmerId, "Beans", "Rosecoco", LocalDateTime.now(), LocalDateTime.now());
        CropResponse c2 = new CropResponse(2L, farmerId, "Maize", "Hybrid 614", LocalDateTime.now(), LocalDateTime.now());

        when(cropService.getCropsByFarmer(farmerId)).thenReturn(List.of(c1, c2));

        mockMvc.perform(get("/api/v1/farmers/{farmerId}/crops", farmerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Beans"))
                .andExpect(jsonPath("$[1].name").value("Maize"));
    }

    @Test
    @DisplayName("GET /api/v1/farmers/{farmerId}/crops/{cropId} - Success 200")
    void getCropById_Success() throws Exception {
        CropResponse response = new CropResponse(5L, farmerId, "Cassava", "Migyera", LocalDateTime.now(), LocalDateTime.now());

        when(cropService.getCropById(farmerId, 5L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/farmers/{farmerId}/crops/{cropId}", farmerId, 5L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5L))
                .andExpect(jsonPath("$.name").value("Cassava"))
                .andExpect(jsonPath("$.variety").value("Migyera"));
    }

    @Test
    @DisplayName("GET /api/v1/farmers/{farmerId}/crops/{cropId} - 404 Not Found")
    void getCropById_NotFound() throws Exception {
        when(cropService.getCropById(farmerId, 999L))
                .thenThrow(new ResourceNotFoundException("Crop not found with id: 999 for farmer: 1"));

        mockMvc.perform(get("/api/v1/farmers/{farmerId}/crops/{cropId}", farmerId, 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Crop not found with id: 999 for farmer: 1"));
    }

    @Test
    @DisplayName("PUT /api/v1/farmers/{farmerId}/crops/{cropId} - Success 200")
    void updateCrop_Success() throws Exception {
        CropRequest request = new CropRequest("Sweet Maize", "Super 101");
        CropResponse response = new CropResponse(1L, farmerId, "Sweet Maize", "Super 101", LocalDateTime.now(), LocalDateTime.now());

        when(cropService.updateCrop(eq(farmerId), eq(1L), any(CropRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/farmers/{farmerId}/crops/{cropId}", farmerId, 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Sweet Maize"))
                .andExpect(jsonPath("$.variety").value("Super 101"));
    }

    @Test
    @DisplayName("DELETE /api/v1/farmers/{farmerId}/crops/{cropId} - Success 204 No Content")
    void deleteCrop_Success() throws Exception {
        doNothing().when(cropService).deleteCrop(farmerId, 1L);

        mockMvc.perform(delete("/api/v1/farmers/{farmerId}/crops/{cropId}", farmerId, 1L))
                .andExpect(status().isNoContent());

        verify(cropService).deleteCrop(farmerId, 1L);
    }
}
