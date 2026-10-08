package com.farmer.tracking.modules.input.controller;

import com.farmer.tracking.common.exception.GlobalExceptionHandler;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.input.api.FarmInputRequest;
import com.farmer.tracking.modules.input.api.FarmInputResponse;
import com.farmer.tracking.modules.input.entity.InputType;
import com.farmer.tracking.modules.input.service.FarmInputService;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FarmInputController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class FarmInputControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FarmInputService farmInputService;

    @MockBean
    private com.farmer.tracking.common.security.JwtTokenProvider jwtTokenProvider;

    @MockBean
    private com.farmer.tracking.common.security.CustomUserDetailsService customUserDetailsService;

    private ObjectMapper objectMapper;
    private final Long farmerId = 1L;
    private final Long inputId = 10L;
    private FarmInputResponse sampleResponse;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        sampleResponse = new FarmInputResponse(
                inputId, farmerId, "Maize Seeds", InputType.SEEDS,
                50.0, "kg", LocalDate.now().minusDays(5), 4500.0, 4500.0,
                LocalDateTime.now(), LocalDateTime.now()
        );
    }

    @Test
    @DisplayName("POST registers new input and returns 201 Created")
    void shouldRegisterInputAndReturn201() throws Exception {
        FarmInputRequest request = new FarmInputRequest(
                "Maize Seeds", InputType.SEEDS, 50.0, "kg",
                LocalDate.now().minusDays(5), 4500.0
        );

        when(farmInputService.registerOrUpdateInput(eq(farmerId), any(FarmInputRequest.class)))
                .thenReturn(sampleResponse);

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/inputs", farmerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(inputId))
                .andExpect(jsonPath("$.name").value("Maize Seeds"))
                .andExpect(jsonPath("$.type").value("SEEDS"))
                .andExpect(jsonPath("$.quantity").value(50.0))
                .andExpect(jsonPath("$.cumulativeCost").value(4500.0));
    }

    @Test
    @DisplayName("POST with null quantity returns 400 Bad Request with validation error")
    void shouldReturn400WhenQuantityIsNull() throws Exception {
        FarmInputRequest invalid = new FarmInputRequest(
                "Seeds", InputType.SEEDS, null, "kg",
                LocalDate.now(), 1000.0
        );

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/inputs", farmerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.validationErrors.quantity").exists());
    }

    @Test
    @DisplayName("POST with negative purchase price returns 400 Bad Request")
    void shouldReturn400WhenPurchasePriceIsNegative() throws Exception {
        FarmInputRequest invalid = new FarmInputRequest(
                "Seeds", InputType.SEEDS, 50.0, "kg",
                LocalDate.now(), -500.0
        );

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/inputs", farmerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.validationErrors.purchasePrice").exists());
    }

    @Test
    @DisplayName("POST with missing name returns 400 Bad Request")
    void shouldReturn400WhenNameIsMissing() throws Exception {
        FarmInputRequest invalid = new FarmInputRequest(
                "", InputType.SEEDS, 50.0, "kg",
                LocalDate.now(), 1000.0
        );

        mockMvc.perform(post("/api/v1/farmers/{farmerId}/inputs", farmerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.validationErrors.name").exists());
    }

    @Test
    @DisplayName("GET returns 200 with list of all inputs for farmer")
    void shouldReturnInputList() throws Exception {
        when(farmInputService.getInputsByFarmer(farmerId)).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/v1/farmers/{farmerId}/inputs", farmerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(inputId))
                .andExpect(jsonPath("$[0].name").value("Maize Seeds"));
    }

    @Test
    @DisplayName("GET /{inputId} returns 404 when input not found")
    void shouldReturn404WhenInputNotFound() throws Exception {
        when(farmInputService.getInputById(farmerId, 999L))
                .thenThrow(new ResourceNotFoundException("Farm input", 999L));

        mockMvc.perform(get("/api/v1/farmers/{farmerId}/inputs/{inputId}", farmerId, 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
