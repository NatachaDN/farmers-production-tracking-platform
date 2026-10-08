package com.farmer.tracking.modules.plot.controller;

import com.farmer.tracking.common.exception.GlobalExceptionHandler;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.plot.api.PlotRequest;
import com.farmer.tracking.modules.plot.api.PlotResponse;
import com.farmer.tracking.modules.plot.service.PlotService;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PlotController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class PlotControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PlotService plotService;

    @MockBean
    private com.farmer.tracking.common.security.JwtTokenProvider jwtTokenProvider;

    @MockBean
    private com.farmer.tracking.common.security.CustomUserDetailsService customUserDetailsService;

    private ObjectMapper objectMapper;

    private final Long farmerId = 1L;
    private final Long plotId = 10L;
    private PlotResponse sampleResponse;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();

        sampleResponse = new PlotResponse(
                plotId, farmerId, "Plot A — Maize", 2.5, "North Field",
                "Maize", "Vegetative growth", LocalDateTime.now(), LocalDateTime.now()
        );
    }

    @Test
    @DisplayName("POST /api/v1/farmers/{farmerId}/plots registers plot and returns 201 Created")
    void shouldRegisterPlotAndReturn201() throws Exception {
        PlotRequest request = new PlotRequest("Plot A — Maize", 2.5, "North Field", "Maize", "Vegetative growth");

        when(plotService.createPlot(eq(farmerId), any(PlotRequest.class))).thenReturn(sampleResponse);

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/plots", farmerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(plotId))
                .andExpect(jsonPath("$.name").value("Plot A — Maize"))
                .andExpect(jsonPath("$.area").value(2.5))
                .andExpect(jsonPath("$.location").value("North Field"));
    }

    @Test
    @DisplayName("POST with negative area returns 400 Bad Request with validation error")
    void shouldReturn400WhenAreaIsNegative() throws Exception {
        PlotRequest invalidRequest = new PlotRequest("Plot B", -2.5, "East Field");

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/plots", farmerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.validationErrors.area").exists());
    }

    @Test
    @DisplayName("POST with missing name returns 400 Bad Request with validation error")
    void shouldReturn400WhenNameIsMissing() throws Exception {
        PlotRequest invalidRequest = new PlotRequest("", 2.5, "East Field");

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/plots", farmerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.validationErrors.name").exists());
    }

    @Test
    @DisplayName("GET /api/v1/farmers/{farmerId}/plots returns 200 OK with list of plots")
    void shouldReturnPlotsList() throws Exception {
        when(plotService.getPlotsByFarmer(farmerId)).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/v1/farmers/{farmerId}/plots", farmerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(plotId))
                .andExpect(jsonPath("$[0].name").value("Plot A — Maize"));
    }

    @Test
    @DisplayName("GET /api/v1/farmers/{farmerId}/plots/{plotId} returns 404 when plot not found")
    void shouldReturn404WhenPlotNotFound() throws Exception {
        when(plotService.getPlotById(farmerId, 999L))
                .thenThrow(new ResourceNotFoundException("Plot", 999L));

        mockMvc.perform(get("/api/v1/farmers/{farmerId}/plots/{plotId}", farmerId, 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
