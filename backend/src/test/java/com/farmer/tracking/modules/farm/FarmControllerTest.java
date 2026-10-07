package com.farmer.tracking.modules.farm;

import com.farmer.tracking.common.security.JwtAuthenticationFilter;
import com.farmer.tracking.common.security.JwtTokenProvider;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.auth.model.FarmType;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.farm.controller.FarmController;
import com.farmer.tracking.modules.farm.dto.CreateFarmRequest;
import com.farmer.tracking.modules.farm.dto.FarmResponse;
import com.farmer.tracking.modules.farm.dto.UpdateFarmRequest;
import com.farmer.tracking.modules.farm.model.FarmStatus;
import com.farmer.tracking.modules.farm.model.SizeUnit;
import com.farmer.tracking.modules.farm.service.FarmService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FarmController.class)
@AutoConfigureMockMvc(addFilters = false)
class FarmControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private FarmService farmService;

    @MockBean
    private FarmerRepository farmerRepository;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private UserPrincipal principal;

    @BeforeEach
    void setUp() {
        Farmer farmer = new Farmer();
        farmer.setId(1L);
        farmer.setFullName("Natacha Maurelle");
        farmer.setEmailOrPhone("natacha@example.com");

        principal = UserPrincipal.create(farmer);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void createFarm_ReturnsCreated_WhenPayloadValid() throws Exception {
        CreateFarmRequest request = new CreateFarmRequest(
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

        FarmResponse response = new FarmResponse();
        response.setId(10L);
        response.setName("Green Valley Farm");
        response.setFarmerId(1L);
        response.setType(FarmType.CROP);
        response.setSize(25.0);
        response.setSizeUnit(SizeUnit.HECTARES);

        when(farmService.createFarm(eq(1L), any(CreateFarmRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/farms")
                        .principal(new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.name").value("Green Valley Farm"))
                .andExpect(jsonPath("$.size").value(25.0));
    }

    @Test
    void createFarm_ReturnsBadRequest_WhenValidationFails() throws Exception {
        CreateFarmRequest request = new CreateFarmRequest();
        // Empty name, null size, etc.

        mockMvc.perform(post("/api/v1/farms")
                        .principal(new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }

    @Test
    void getFarms_ReturnsFarmList() throws Exception {
        FarmResponse response = new FarmResponse();
        response.setId(10L);
        response.setName("Green Valley Farm");

        when(farmService.getFarmsByFarmer(1L)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/farms")
                        .principal(new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Green Valley Farm"));
    }

    @Test
    void getFarmById_ReturnsFarmDetails() throws Exception {
        FarmResponse response = new FarmResponse();
        response.setId(10L);
        response.setName("Green Valley Farm");

        when(farmService.getFarmById(10L, 1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/farms/10")
                        .principal(new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.name").value("Green Valley Farm"));
    }

    @Test
    void updateFarm_ReturnsUpdatedFarm() throws Exception {
        UpdateFarmRequest updateReq = new UpdateFarmRequest();
        updateReq.setName("Green Valley Farm Updated");
        updateReq.setType(FarmType.MIXED);
        updateReq.setSize(30.0);
        updateReq.setSizeUnit(SizeUnit.HECTARES);
        updateReq.setStatus(FarmStatus.ACTIVE);
        updateReq.setCountry("Cameroon");
        updateReq.setRegion("West");
        updateReq.setDistrict("Bafoussam");

        FarmResponse response = new FarmResponse();
        response.setId(10L);
        response.setName("Green Valley Farm Updated");

        when(farmService.updateFarm(eq(10L), eq(1L), any(UpdateFarmRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/farms/10")
                        .principal(new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Green Valley Farm Updated"));
    }
}
