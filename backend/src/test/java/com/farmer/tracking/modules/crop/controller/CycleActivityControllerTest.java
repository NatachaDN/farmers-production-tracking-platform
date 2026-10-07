package com.farmer.tracking.modules.crop.controller;

import com.farmer.tracking.common.exception.GlobalExceptionHandler;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.crop.api.CycleActivityRequest;
import com.farmer.tracking.modules.crop.api.CycleActivityResponse;
import com.farmer.tracking.modules.crop.entity.ActivityType;
import com.farmer.tracking.modules.crop.service.CycleActivityService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CycleActivityController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class CycleActivityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CycleActivityService activityService;

    @MockBean
    private com.farmer.tracking.common.security.JwtTokenProvider jwtTokenProvider;

    @MockBean
    private com.farmer.tracking.common.security.CustomUserDetailsService customUserDetailsService;

    private ObjectMapper objectMapper;

    private final Long farmerId = 1L;
    private final Long cycleId = 10L;
    private final Long activityId = 100L;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Test
    @DisplayName("GET /api/v1/farmers/{farmerId}/cycles/{cycleId}/activities returns list of activities")
    void shouldReturnActivityList() throws Exception {
        CycleActivityResponse res = new CycleActivityResponse(
                activityId, cycleId, ActivityType.WATERING,
                LocalDate.of(2026, 3, 10), "Morning irrigation",
                LocalDateTime.now(), LocalDateTime.now()
        );

        when(activityService.getActivitiesByCycle(farmerId, cycleId)).thenReturn(List.of(res));

        mockMvc.perform(get("/api/v1/farmers/{farmerId}/cycles/{cycleId}/activities", farmerId, cycleId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(activityId))
                .andExpect(jsonPath("$[0].activityType").value("WATERING"))
                .andExpect(jsonPath("$[0].activityDate").value("2026-03-10"))
                .andExpect(jsonPath("$[0].notes").value("Morning irrigation"));
    }

    @Test
    @DisplayName("POST /api/v1/farmers/{farmerId}/cycles/{cycleId}/activities creates activity when valid")
    void shouldCreateActivityWhenValid() throws Exception {
        CycleActivityRequest request = new CycleActivityRequest(
                ActivityType.WEEDING,
                LocalDate.of(2026, 3, 12),
                "Manual weeding along rows"
        );

        CycleActivityResponse response = new CycleActivityResponse(
                activityId, cycleId, ActivityType.WEEDING,
                LocalDate.of(2026, 3, 12), "Manual weeding along rows",
                LocalDateTime.now(), LocalDateTime.now()
        );

        when(activityService.createActivity(eq(farmerId), eq(cycleId), any(CycleActivityRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/cycles/{cycleId}/activities", farmerId, cycleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(activityId))
                .andExpect(jsonPath("$.activityType").value("WEEDING"))
                .andExpect(jsonPath("$.notes").value("Manual weeding along rows"));
    }

    @Test
    @DisplayName("POST with null activity type or date returns 400 Bad Request with field errors")
    void shouldReturnBadRequestWhenInputInvalid() throws Exception {
        CycleActivityRequest invalidRequest = new CycleActivityRequest(
                null, // Missing type
                null, // Missing date
                "Some notes"
        );

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/cycles/{cycleId}/activities", farmerId, cycleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Input payload contains invalid fields"))
                .andExpect(jsonPath("$.validationErrors.activityType").exists())
                .andExpect(jsonPath("$.validationErrors.activityDate").exists());
    }

    @Test
    @DisplayName("GET non-existent cycle activity returns 404 Not Found")
    void shouldReturnNotFoundWhenCycleDoesNotExist() throws Exception {
        when(activityService.getActivitiesByCycle(farmerId, 999L))
                .thenThrow(new ResourceNotFoundException("Cycle not found with id: 999 for farmer: 1"));

        mockMvc.perform(get("/api/v1/farmers/{farmerId}/cycles/{cycleId}/activities", farmerId, 999L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Cycle not found with id: 999 for farmer: 1"));
    }

    @Test
    @DisplayName("DELETE activity returns 204 No Content")
    void shouldDeleteActivity() throws Exception {
        doNothing().when(activityService).deleteActivity(farmerId, cycleId, activityId);

        mockMvc.perform(delete("/api/v1/farmers/{farmerId}/cycles/{cycleId}/activities/{activityId}",
                        farmerId, cycleId, activityId))
                .andExpect(status().isNoContent());

        verify(activityService).deleteActivity(farmerId, cycleId, activityId);
    }
}
