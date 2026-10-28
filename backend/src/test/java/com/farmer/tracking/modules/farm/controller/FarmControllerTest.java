package com.farmer.tracking.modules.farm.controller;

import com.farmer.tracking.common.exception.ForbiddenException;
import com.farmer.tracking.common.exception.GlobalExceptionHandler;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.security.CustomUserDetailsService;
import com.farmer.tracking.common.security.JwtAuthenticationFilter;
import com.farmer.tracking.common.security.JwtTokenProvider;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.auth.model.FarmType;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.farm.dto.CreateFarmRequest;
import com.farmer.tracking.modules.farm.dto.FarmResponse;
import com.farmer.tracking.modules.farm.dto.UpdateFarmRequest;
import com.farmer.tracking.modules.farm.model.FarmStatus;
import com.farmer.tracking.modules.farm.model.SizeUnit;
import com.farmer.tracking.modules.farm.service.FarmService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer tests for FarmController (current API: /api/v1/farms, authenticated farmer
 * taken from the security context, dto.* request/response classes).
 */
@WebMvcTest(FarmController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class FarmControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private FarmService farmService;

    @MockBean
    private FarmerRepository farmerRepository;

    // Required so SecurityConfig / JwtAuthenticationFilter can be created in the WebMvc slice
    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private static final Long FARMER_ID = 1L;
    private static final Long FARM_ID = 10L;

    private UserPrincipal principal;

    @BeforeEach
    void setUp() {
        Farmer farmer = new Farmer();
        farmer.setId(FARMER_ID);
        farmer.setFullName("Natacha Maurelle");
        farmer.setEmailOrPhone("natacha@example.com");

        principal = UserPrincipal.create(farmer);
        authenticateAs(principal);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(org.springframework.security.core.userdetails.UserDetails user) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
    }

    private CreateFarmRequest validCreateRequest() {
        return new CreateFarmRequest(
                "Green Valley Farm",
                FarmType.CROP,
                25.0,
                SizeUnit.HECTARES,
                "Main farm",
                FarmStatus.ACTIVE,
                "Cameroon",
                "West",
                "Bafoussam"
        );
    }

    private UpdateFarmRequest validUpdateRequest() {
        UpdateFarmRequest req = new UpdateFarmRequest();
        req.setName("Green Valley Organic");
        req.setType(FarmType.MIXED);
        req.setSize(40.5);
        req.setSizeUnit(SizeUnit.ACRES);
        req.setDescription("Updated holding");
        req.setStatus(FarmStatus.ACTIVE);
        req.setCountry("Cameroon");
        req.setRegion("Centre");
        req.setDistrict("Mfoundi");
        return req;
    }

    private FarmResponse sampleResponse(String name) {
        FarmResponse response = new FarmResponse();
        response.setId(FARM_ID);
        response.setFarmerId(FARMER_ID);
        response.setName(name);
        response.setType(FarmType.CROP);
        response.setSize(25.0);
        response.setSizeUnit(SizeUnit.HECTARES);
        response.setStatus(FarmStatus.ACTIVE);
        return response;
    }

    // ---------------------------------------------------------------------- POST

    @Test
    @DisplayName("POST /api/v1/farms returns 201 and the created farm")
    void createFarm_ValidPayload_Returns201() throws Exception {
        when(farmService.createFarm(eq(FARMER_ID), any(CreateFarmRequest.class)))
                .thenReturn(sampleResponse("Green Valley Farm"));

        mockMvc.perform(post("/api/v1/farms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validCreateRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(FARM_ID))
                .andExpect(jsonPath("$.farmerId").value(FARMER_ID))
                .andExpect(jsonPath("$.name").value("Green Valley Farm"))
                .andExpect(jsonPath("$.size").value(25.0));
    }

    @Test
    @DisplayName("POST /api/v1/farms with an empty payload returns 400 with field errors")
    void createFarm_EmptyPayload_Returns400() throws Exception {
        mockMvc.perform(post("/api/v1/farms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateFarmRequest())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.validationErrors.size").exists())
                .andExpect(jsonPath("$.validationErrors.type").exists())
                .andExpect(jsonPath("$.validationErrors.country").exists())
                .andExpect(jsonPath("$.validationErrors.region").exists())
                .andExpect(jsonPath("$.validationErrors.district").exists());
    }

    @Test
    @DisplayName("POST /api/v1/farms with a blank name returns 400 on the name field")
    void createFarm_BlankName_Returns400() throws Exception {
        CreateFarmRequest request = validCreateRequest();
        request.setName("   ");

        mockMvc.perform(post("/api/v1/farms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.name").value("Farm name is required"));
    }

    @Test
    @DisplayName("POST /api/v1/farms with a negative size returns 400 on the size field")
    void createFarm_NegativeSize_Returns400() throws Exception {
        CreateFarmRequest request = validCreateRequest();
        request.setSize(-5.0);

        mockMvc.perform(post("/api/v1/farms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.size").value("Farm size must be a positive value"));
    }

    // ----------------------------------------------------------------------- GET

    @Test
    @DisplayName("GET /api/v1/farms returns 200 with the farmer's farms")
    void getFarms_Returns200WithList() throws Exception {
        when(farmService.getFarmsByFarmer(FARMER_ID))
                .thenReturn(List.of(sampleResponse("Green Valley Farm")));

        mockMvc.perform(get("/api/v1/farms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(FARM_ID))
                .andExpect(jsonPath("$[0].name").value("Green Valley Farm"));
    }

    @Test
    @DisplayName("GET /api/farms (legacy path) is also served by the controller")
    void getFarms_LegacyPath_Returns200() throws Exception {
        when(farmService.getFarmsByFarmer(FARMER_ID)).thenReturn(List.of());

        mockMvc.perform(get("/api/farms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("GET /api/v1/farms/{id} returns 200 with the farm")
    void getFarmById_Returns200() throws Exception {
        when(farmService.getFarmById(FARM_ID, FARMER_ID))
                .thenReturn(sampleResponse("Green Valley Farm"));

        mockMvc.perform(get("/api/v1/farms/{id}", FARM_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(FARM_ID))
                .andExpect(jsonPath("$.name").value("Green Valley Farm"));
    }

    @Test
    @DisplayName("GET /api/v1/farms/{id} returns 404 when the farm does not exist")
    void getFarmById_NotFound_Returns404() throws Exception {
        when(farmService.getFarmById(999L, FARMER_ID))
                .thenThrow(new ResourceNotFoundException("Farm not found with ID: 999"));

        mockMvc.perform(get("/api/v1/farms/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Farm not found with ID: 999"));
    }

    @Test
    @DisplayName("GET /api/v1/farms/{id} returns 403 when the farm belongs to another farmer")
    void getFarmById_OtherFarmer_Returns403() throws Exception {
        when(farmService.getFarmById(FARM_ID, FARMER_ID))
                .thenThrow(new ForbiddenException("Data Isolation Violation: You do not have permission to access farm 10"));

        mockMvc.perform(get("/api/v1/farms/{id}", FARM_ID))
                .andExpect(status().isForbidden());
    }

    // ----------------------------------------------------------------------- PUT

    @Test
    @DisplayName("PUT /api/v1/farms/{id} returns 200 with the updated farm")
    void updateFarm_ValidPayload_Returns200() throws Exception {
        when(farmService.updateFarm(eq(FARM_ID), eq(FARMER_ID), any(UpdateFarmRequest.class)))
                .thenReturn(sampleResponse("Green Valley Organic"));

        mockMvc.perform(put("/api/v1/farms/{id}", FARM_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validUpdateRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Green Valley Organic"));
    }

    @Test
    @DisplayName("PUT /api/v1/farms/{id} with an invalid payload returns 400")
    void updateFarm_InvalidPayload_Returns400() throws Exception {
        mockMvc.perform(put("/api/v1/farms/{id}", FARM_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateFarmRequest())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }

    @Test
    @DisplayName("PUT /api/v1/farms/{id} returns 403 when the farm belongs to another farmer")
    void updateFarm_OtherFarmer_Returns403() throws Exception {
        when(farmService.updateFarm(eq(FARM_ID), eq(FARMER_ID), any(UpdateFarmRequest.class)))
                .thenThrow(new ForbiddenException("Data Isolation Violation"));

        mockMvc.perform(put("/api/v1/farms/{id}", FARM_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validUpdateRequest())))
                .andExpect(status().isForbidden());
    }

    // ------------------------------------------------ farmer id resolution fallback

    @Test
    @DisplayName("A plain UserDetails principal is resolved to the farmer through the repository")
    void getFarms_PlainUserDetails_ResolvesFarmerByUsername() throws Exception {
        authenticateAs(User.withUsername("natacha@example.com").password("x").authorities("ROLE_FARMER").build());

        Farmer farmer = new Farmer();
        farmer.setId(FARMER_ID);
        when(farmerRepository.findByEmailOrPhone("natacha@example.com")).thenReturn(Optional.of(farmer));
        when(farmService.getFarmsByFarmer(FARMER_ID)).thenReturn(List.of(sampleResponse("Green Valley Farm")));

        mockMvc.perform(get("/api/v1/farms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Green Valley Farm"));
    }

    @Test
    @DisplayName("A plain UserDetails principal unknown to the repository returns 404")
    void getFarms_UnknownUser_Returns404() throws Exception {
        authenticateAs(User.withUsername("ghost@example.com").password("x").authorities("ROLE_FARMER").build());

        when(farmerRepository.findByEmailOrPhone("ghost@example.com")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/farms"))
                .andExpect(status().isNotFound());
    }
}