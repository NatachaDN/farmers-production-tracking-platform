package com.farmer.tracking.modules.animal.controller;

import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.ForbiddenException;
import com.farmer.tracking.common.exception.GlobalExceptionHandler;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.security.CustomUserDetailsService;
import com.farmer.tracking.common.security.JwtAuthenticationFilter;
import com.farmer.tracking.common.security.JwtTokenProvider;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.animal.dto.AnimalGroupResponse;
import com.farmer.tracking.modules.animal.dto.CreateAnimalGroupRequest;
import com.farmer.tracking.modules.animal.dto.UpdateAnimalGroupRequest;
import com.farmer.tracking.modules.animal.model.AnimalGroupStatus;
import com.farmer.tracking.modules.animal.model.AnimalType;
import com.farmer.tracking.modules.animal.service.AnimalGroupService;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
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
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AnimalGroupController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class AnimalGroupControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AnimalGroupService animalGroupService;

    @MockBean
    private FarmerRepository farmerRepository;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private static final Long FARMER_ID = 1L;
    private static final Long OTHER_FARMER_ID = 2L;
    private static final Long GROUP_ID = 10L;

    private UserPrincipal principal;
    private AnimalGroupResponse sampleResponse;

    @BeforeEach
    void setUp() {
        Farmer farmer = new Farmer();
        farmer.setId(FARMER_ID);
        farmer.setFullName("Joyce Muthoni");
        farmer.setEmailOrPhone("joyce@example.com");

        principal = UserPrincipal.create(farmer);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));

        sampleResponse = new AnimalGroupResponse();
        sampleResponse.setId(GROUP_ID);
        sampleResponse.setFarmerId(FARMER_ID);
        sampleResponse.setName("Dairy Herd A");
        sampleResponse.setAnimalType(AnimalType.CATTLE);
        sampleResponse.setAnimalTypeDisplay("Cattle");
        sampleResponse.setBreed("Holstein Friesian");
        sampleResponse.setInitialPopulation(30);
        sampleResponse.setCurrentPopulation(30);
        sampleResponse.setLocation("Barn 2");
        sampleResponse.setPurpose("Milk Production");
        sampleResponse.setStatus(AnimalGroupStatus.ACTIVE);
        sampleResponse.setStartDate(LocalDate.of(2026, 1, 15));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // -------------------------------------------------------------------------
    // POST /api/v1/animals/groups (AC-01, AC-02)
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("POST /api/v1/animals/groups: returns 201 Created on valid request")
    void createGroup_success() throws Exception {
        CreateAnimalGroupRequest request = new CreateAnimalGroupRequest();
        request.setName("Dairy Herd A");
        request.setAnimalType(AnimalType.CATTLE);
        request.setBreed("Holstein Friesian");
        request.setInitialPopulation(30);
        request.setLocation("Barn 2");
        request.setPurpose("Milk Production");

        when(animalGroupService.createAnimalGroup(eq(FARMER_ID), any(CreateAnimalGroupRequest.class)))
                .thenReturn(sampleResponse);

        mockMvc.perform(post("/api/v1/animals/groups")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(GROUP_ID))
                .andExpect(jsonPath("$.name").value("Dairy Herd A"))
                .andExpect(jsonPath("$.animalType").value("CATTLE"))
                .andExpect(jsonPath("$.initialPopulation").value(30))
                .andExpect(jsonPath("$.farmerId").value(FARMER_ID));

        verify(animalGroupService).createAnimalGroup(eq(FARMER_ID), any(CreateAnimalGroupRequest.class));
    }

    @Test
    @DisplayName("POST /api/animals/groups: works on alternate route mapping")
    void createGroup_alternateRoute_success() throws Exception {
        CreateAnimalGroupRequest request = new CreateAnimalGroupRequest();
        request.setName("Dairy Herd A");
        request.setAnimalType(AnimalType.CATTLE);
        request.setInitialPopulation(30);

        when(animalGroupService.createAnimalGroup(eq(FARMER_ID), any(CreateAnimalGroupRequest.class)))
                .thenReturn(sampleResponse);

        mockMvc.perform(post("/api/animals/groups")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(GROUP_ID));
    }

    @Test
    @DisplayName("POST /api/v1/animals/groups: returns 400 Bad Request when name is missing")
    void createGroup_missingName_badRequest() throws Exception {
        CreateAnimalGroupRequest request = new CreateAnimalGroupRequest();
        request.setName(""); // blank
        request.setAnimalType(AnimalType.CATTLE);
        request.setInitialPopulation(30);

        mockMvc.perform(post("/api/v1/animals/groups")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(animalGroupService, never()).createAnimalGroup(any(), any());
    }

    @Test
    @DisplayName("POST /api/v1/animals/groups: returns 400 Bad Request when animalType is null")
    void createGroup_missingAnimalType_badRequest() throws Exception {
        CreateAnimalGroupRequest request = new CreateAnimalGroupRequest();
        request.setName("Flock");
        request.setAnimalType(null); // missing
        request.setInitialPopulation(30);

        mockMvc.perform(post("/api/v1/animals/groups")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(animalGroupService, never()).createAnimalGroup(any(), any());
    }

    @Test
    @DisplayName("POST /api/v1/animals/groups: returns 400 Bad Request when initialPopulation is <= 0")
    void createGroup_nonPositivePopulation_badRequest() throws Exception {
        CreateAnimalGroupRequest request = new CreateAnimalGroupRequest();
        request.setName("Flock");
        request.setAnimalType(AnimalType.POULTRY);
        request.setInitialPopulation(0); // must be > 0

        mockMvc.perform(post("/api/v1/animals/groups")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(animalGroupService, never()).createAnimalGroup(any(), any());
    }

    // -------------------------------------------------------------------------
    // GET /api/v1/animals/groups (AC-03, AC-04)
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("GET /api/v1/animals/groups: returns 200 with list of groups")
    void getGroups_success() throws Exception {
        when(animalGroupService.getAnimalGroupsByFarmer(FARMER_ID))
                .thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/v1/animals/groups"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Dairy Herd A"));

        verify(animalGroupService).getAnimalGroupsByFarmer(FARMER_ID);
    }

    @Test
    @DisplayName("GET /api/v1/animals/groups: returns 200 with empty array (AC-04 empty state)")
    void getGroups_emptyState() throws Exception {
        when(animalGroupService.getAnimalGroupsByFarmer(FARMER_ID))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/v1/animals/groups"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // -------------------------------------------------------------------------
    // GET /api/v1/animals/groups/{id} (AC-05, AC-07)
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("GET /api/v1/animals/groups/{id}: returns 200 with details for owned group")
    void getGroupById_success() throws Exception {
        when(animalGroupService.getAnimalGroupById(GROUP_ID, FARMER_ID))
                .thenReturn(sampleResponse);

        mockMvc.perform(get("/api/v1/animals/groups/{id}", GROUP_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(GROUP_ID))
                .andExpect(jsonPath("$.name").value("Dairy Herd A"))
                .andExpect(jsonPath("$.breed").value("Holstein Friesian"));
    }

    @Test
    @DisplayName("GET /api/v1/animals/groups/{id}: returns 403 Forbidden when owned by another farmer (AC-07)")
    void getGroupById_forbidden() throws Exception {
        when(animalGroupService.getAnimalGroupById(GROUP_ID, FARMER_ID))
                .thenThrow(new ForbiddenException("Data Isolation Violation"));

        mockMvc.perform(get("/api/v1/animals/groups/{id}", GROUP_ID))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/v1/animals/groups/{id}: returns 404 Not Found when group does not exist")
    void getGroupById_notFound() throws Exception {
        when(animalGroupService.getAnimalGroupById(999L, FARMER_ID))
                .thenThrow(new ResourceNotFoundException("Animal group not found"));

        mockMvc.perform(get("/api/v1/animals/groups/{id}", 999L))
                .andExpect(status().isNotFound());
    }

    // -------------------------------------------------------------------------
    // PUT /api/v1/animals/groups/{id} (AC-06, AC-07)
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("PUT /api/v1/animals/groups/{id}: returns 200 with updated response")
    void updateGroup_success() throws Exception {
        UpdateAnimalGroupRequest request = new UpdateAnimalGroupRequest();
        request.setName("Dairy Herd A — Milking");
        request.setAnimalType(AnimalType.CATTLE);
        request.setCurrentPopulation(28);

        AnimalGroupResponse updated = new AnimalGroupResponse();
        updated.setId(GROUP_ID);
        updated.setFarmerId(FARMER_ID);
        updated.setName("Dairy Herd A — Milking");
        updated.setAnimalType(AnimalType.CATTLE);
        updated.setCurrentPopulation(28);

        when(animalGroupService.updateAnimalGroup(eq(GROUP_ID), eq(FARMER_ID), any(UpdateAnimalGroupRequest.class)))
                .thenReturn(updated);

        mockMvc.perform(put("/api/v1/animals/groups/{id}", GROUP_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Dairy Herd A — Milking"))
                .andExpect(jsonPath("$.currentPopulation").value(28));
    }

    @Test
    @DisplayName("PUT /api/v1/animals/groups/{id}: returns 400 Bad Request on negative current population")
    void updateGroup_negativePopulation_badRequest() throws Exception {
        UpdateAnimalGroupRequest request = new UpdateAnimalGroupRequest();
        request.setName("Updated");
        request.setAnimalType(AnimalType.CATTLE);
        request.setCurrentPopulation(-1); // negative

        mockMvc.perform(put("/api/v1/animals/groups/{id}", GROUP_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(animalGroupService, never()).updateAnimalGroup(any(), any(), any());
    }

    // -------------------------------------------------------------------------
    // DELETE /api/v1/animals/groups/{id} (AC-08, AC-09)
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("DELETE /api/v1/animals/groups/{id}: returns 204 No Content on successful deletion (AC-08)")
    void deleteGroup_success() throws Exception {
        doNothing().when(animalGroupService).deleteAnimalGroup(GROUP_ID, FARMER_ID);

        mockMvc.perform(delete("/api/v1/animals/groups/{id}", GROUP_ID))
                .andExpect(status().isNoContent());

        verify(animalGroupService).deleteAnimalGroup(GROUP_ID, FARMER_ID);
    }

    @Test
    @DisplayName("DELETE /api/v1/animals/groups/{id}: returns 409 Conflict when protected records exist (AC-09)")
    void deleteGroup_conflictWhenProtected() throws Exception {
        doThrow(new ConflictException("Cannot delete animal group with protected historical records"))
                .when(animalGroupService).deleteAnimalGroup(GROUP_ID, FARMER_ID);

        mockMvc.perform(delete("/api/v1/animals/groups/{id}", GROUP_ID))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("DELETE /api/v1/animals/groups/{id}: returns 403 Forbidden when owned by another farmer")
    void deleteGroup_forbidden() throws Exception {
        doThrow(new ForbiddenException("Data Isolation Violation"))
                .when(animalGroupService).deleteAnimalGroup(GROUP_ID, FARMER_ID);

        mockMvc.perform(delete("/api/v1/animals/groups/{id}", GROUP_ID))
                .andExpect(status().isForbidden());
    }
}
