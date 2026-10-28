package com.farmer.tracking.modules.crop.controller;

import com.farmer.tracking.common.exception.GlobalExceptionHandler;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.crop.api.CycleIncidentRequest;
import com.farmer.tracking.modules.crop.api.CycleIncidentResponse;
import com.farmer.tracking.modules.crop.entity.IncidentType;
import com.farmer.tracking.modules.crop.service.CycleIncidentService;
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

@WebMvcTest(CycleIncidentController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class CycleIncidentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CycleIncidentService incidentService;

    @MockBean
    private com.farmer.tracking.common.security.JwtTokenProvider jwtTokenProvider;

    @MockBean
    private com.farmer.tracking.common.security.CustomUserDetailsService customUserDetailsService;

    private ObjectMapper objectMapper;

    private final Long farmerId   = 1L;
    private final Long cycleId    = 10L;
    private final Long incidentId = 100L;

    private CycleIncidentResponse sampleResponse;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        sampleResponse = new CycleIncidentResponse(
                incidentId, cycleId, farmerId,
                IncidentType.DISEASE,
                LocalDate.of(2026, 3, 10),
                "Early blight detected on lower leaves",
                3,
                "Applied copper-based fungicide",
                LocalDateTime.now(), LocalDateTime.now()
        );
    }

    // ------------------------------------------------------------------ //
    //  GET list                                                            //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("GET /…/incidents returns list of incidents for cycle")
    void shouldReturnIncidentList() throws Exception {
        when(incidentService.getIncidentsByCycle(farmerId, cycleId)).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/v1/farmers/{farmerId}/cycles/{cycleId}/incidents",
                        farmerId, cycleId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(incidentId))
                .andExpect(jsonPath("$[0].incidentType").value("DISEASE"))
                .andExpect(jsonPath("$[0].incidentDate").value("2026-03-10"))
                .andExpect(jsonPath("$[0].description").value("Early blight detected on lower leaves"))
                .andExpect(jsonPath("$[0].severityLevel").value(3));
    }

    @Test
    @DisplayName("GET /…/incidents returns 404 when cycle does not belong to farmer")
    void shouldReturnNotFoundWhenCycleMissing() throws Exception {
        when(incidentService.getIncidentsByCycle(farmerId, 999L))
                .thenThrow(new ResourceNotFoundException("Cycle not found with id: 999 for farmer: 1"));

        mockMvc.perform(get("/api/v1/farmers/{farmerId}/cycles/{cycleId}/incidents",
                        farmerId, 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Cycle not found with id: 999 for farmer: 1"));
    }

    // ------------------------------------------------------------------ //
    //  POST create                                                         //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("POST /…/incidents creates incident when payload is valid")
    void shouldCreateIncident() throws Exception {
        CycleIncidentRequest request = new CycleIncidentRequest(
                IncidentType.PEST,
                LocalDate.of(2026, 3, 15),
                "Aphid infestation spotted on stems",
                2,
                "Sprayed neem oil"
        );

        when(incidentService.createIncident(eq(farmerId), eq(cycleId), any(CycleIncidentRequest.class)))
                .thenReturn(sampleResponse);

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/cycles/{cycleId}/incidents",
                        farmerId, cycleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(incidentId))
                .andExpect(jsonPath("$.incidentType").value("DISEASE"));
    }

    @Test
    @DisplayName("POST with missing required fields returns 400 Bad Request with field errors")
    void shouldReturnBadRequestWhenPayloadInvalid() throws Exception {
        // incidentType=null, incidentDate=null, description=blank
        CycleIncidentRequest invalidRequest = new CycleIncidentRequest(
                null, null, "", null, null
        );

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/cycles/{cycleId}/incidents",
                        farmerId, cycleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Input payload contains invalid fields"))
                .andExpect(jsonPath("$.validationErrors.incidentType").exists())
                .andExpect(jsonPath("$.validationErrors.incidentDate").exists())
                .andExpect(jsonPath("$.validationErrors.description").exists());
    }

    @Test
    @DisplayName("POST with severity out of range returns 400 Bad Request")
    void shouldReturnBadRequestWhenSeverityOutOfRange() throws Exception {
        CycleIncidentRequest badSeverity = new CycleIncidentRequest(
                IncidentType.DISEASE,
                LocalDate.of(2026, 3, 10),
                "Some description",
                10, // invalid: > 5
                null
        );

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/cycles/{cycleId}/incidents",
                        farmerId, cycleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badSeverity)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.severityLevel").exists());
    }

    // ------------------------------------------------------------------ //
    //  PUT update                                                          //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("PUT /…/incidents/{id} updates incident when payload is valid")
    void shouldUpdateIncident() throws Exception {
        CycleIncidentRequest request = new CycleIncidentRequest(
                IncidentType.WEATHER,
                LocalDate.of(2026, 3, 12),
                "Hail damage to canopy",
                4,
                "Covered with shade net"
        );

        when(incidentService.updateIncident(eq(farmerId), eq(cycleId), eq(incidentId),
                any(CycleIncidentRequest.class))).thenReturn(sampleResponse);

        mockMvc.perform(put("/api/v1/farmers/{farmerId}/cycles/{cycleId}/incidents/{incidentId}",
                        farmerId, cycleId, incidentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(incidentId));
    }

    // ------------------------------------------------------------------ //
    //  DELETE                                                              //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("DELETE /…/incidents/{id} returns 204 No Content")
    void shouldDeleteIncident() throws Exception {
        doNothing().when(incidentService).deleteIncident(farmerId, cycleId, incidentId);

        mockMvc.perform(delete("/api/v1/farmers/{farmerId}/cycles/{cycleId}/incidents/{incidentId}",
                        farmerId, cycleId, incidentId))
                .andExpect(status().isNoContent());

        verify(incidentService).deleteIncident(farmerId, cycleId, incidentId);
    }
}
