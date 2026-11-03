package com.farmer.tracking.modules.farm.service;

import com.farmer.tracking.common.exception.ForbiddenException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.auth.model.FarmType;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.farm.dto.CreateFarmRequest;
import com.farmer.tracking.modules.farm.dto.FarmResponse;
import com.farmer.tracking.modules.farm.dto.UpdateFarmRequest;
import com.farmer.tracking.modules.farm.mapper.FarmMapper;
import com.farmer.tracking.modules.farm.model.Farm;
import com.farmer.tracking.modules.farm.model.FarmStatus;
import com.farmer.tracking.modules.farm.model.SizeUnit;
import com.farmer.tracking.modules.farm.repository.FarmRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * Unit tests for FarmServiceImpl (current implementation: dto + model.Farm + FarmMapper).
 * The real FarmMapper is used so that mapping and trimming behaviour is verified end to end.
 */
@ExtendWith(MockitoExtension.class)
class FarmServiceTest {

    @Mock
    private FarmRepository farmRepository;

    @Mock
    private FarmerRepository farmerRepository;

    private FarmServiceImpl farmService;

    private static final Long OWNER_ID = 1L;
    private static final Long OTHER_ID = 2L;
    private static final Long FARM_ID = 10L;

    private Farmer owner;
    private Farm ownedFarm;

    @BeforeEach
    void setUp() {
        farmService = new FarmServiceImpl(farmRepository, farmerRepository, new FarmMapper());

        owner = new Farmer();
        owner.setId(OWNER_ID);
        owner.setFullName("Natacha Maurelle");
        owner.setEmailOrPhone("natacha@example.com");

        ownedFarm = new Farm();
        ownedFarm.setId(FARM_ID);
        ownedFarm.setFarmer(owner);
        ownedFarm.setName("Green Valley Farm");
        ownedFarm.setType(FarmType.CROP);
        ownedFarm.setSize(25.0);
        ownedFarm.setSizeUnit(SizeUnit.HECTARES);
        ownedFarm.setStatus(FarmStatus.ACTIVE);
        ownedFarm.setCountry("Cameroon");
        ownedFarm.setRegion("West");
        ownedFarm.setDistrict("Bafoussam");
    }

    private CreateFarmRequest validCreateRequest() {
        return new CreateFarmRequest(
                "  Green Valley Farm  ",
                FarmType.CROP,
                25.0,
                SizeUnit.HECTARES,
                "  Main farm  ",
                FarmStatus.ACTIVE,
                " Cameroon ",
                " West ",
                " Bafoussam "
        );
    }

    private UpdateFarmRequest validUpdateRequest() {
        UpdateFarmRequest req = new UpdateFarmRequest();
        req.setName("  Green Valley Organic  ");
        req.setType(FarmType.MIXED);
        req.setSize(40.5);
        req.setSizeUnit(SizeUnit.ACRES);
        req.setDescription("Updated holding");
        req.setStatus(FarmStatus.INACTIVE);
        req.setCountry("Cameroon");
        req.setRegion("Centre");
        req.setDistrict("Mfoundi");
        return req;
    }

    // ---------------------------------------------------------------- createFarm

    @Test
    @DisplayName("createFarm: saves the farm for the authenticated farmer and trims text fields")
    void createFarm_Success_TrimsAndLinksFarmer() {
        when(farmerRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        when(farmRepository.save(any(Farm.class))).thenAnswer(inv -> {
            Farm f = inv.getArgument(0);
            f.setId(FARM_ID);
            return f;
        });

        FarmResponse response = farmService.createFarm(OWNER_ID, validCreateRequest());

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(FARM_ID);
        assertThat(response.getFarmerId()).isEqualTo(OWNER_ID);
        assertThat(response.getFarmerName()).isEqualTo("Natacha Maurelle");
        assertThat(response.getName()).isEqualTo("Green Valley Farm");
        assertThat(response.getDescription()).isEqualTo("Main farm");
        assertThat(response.getCountry()).isEqualTo("Cameroon");
        assertThat(response.getRegion()).isEqualTo("West");
        assertThat(response.getDistrict()).isEqualTo("Bafoussam");
        assertThat(response.getType()).isEqualTo(FarmType.CROP);
        assertThat(response.getSize()).isEqualTo(25.0);
        assertThat(response.getSizeUnit()).isEqualTo(SizeUnit.HECTARES);
        assertThat(response.getStatus()).isEqualTo(FarmStatus.ACTIVE);

        verify(farmRepository).save(any(Farm.class));
    }

    @Test
    @DisplayName("createFarm: optional fields left null stay null after mapping")
    void createFarm_OptionalFieldsNull_StayNull() {
        CreateFarmRequest request = validCreateRequest();
        request.setDescription(null);

        when(farmerRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        when(farmRepository.save(any(Farm.class))).thenAnswer(inv -> inv.getArgument(0));

        FarmResponse response = farmService.createFarm(OWNER_ID, request);

        assertThat(response.getDescription()).isNull();
        assertThat(response.getMapImageUrl()).isNull();
        assertThat(response.getAdditionalNotes()).isNull();
    }

    @Test
    @DisplayName("createFarm: unknown farmer throws ResourceNotFoundException and nothing is saved")
    void createFarm_FarmerNotFound_Throws() {
        when(farmerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> farmService.createFarm(99L, validCreateRequest()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("farmer account not found");

        verifyNoInteractions(farmRepository);
    }

    // ---------------------------------------------------------- getFarmsByFarmer

    @Test
    @DisplayName("getFarmsByFarmer: returns every farm of the farmer, mapped to responses")
    void getFarmsByFarmer_ReturnsMappedList() {
        Farm second = new Farm();
        second.setId(11L);
        second.setFarmer(owner);
        second.setName("Highland Farm");

        when(farmRepository.findByFarmerIdOrderByCreatedAtDesc(OWNER_ID))
                .thenReturn(List.of(ownedFarm, second));

        List<FarmResponse> responses = farmService.getFarmsByFarmer(OWNER_ID);

        assertThat(responses).hasSize(2);
        assertThat(responses).extracting(FarmResponse::getName)
                .containsExactly("Green Valley Farm", "Highland Farm");
        assertThat(responses).extracting(FarmResponse::getFarmerId)
                .containsOnly(OWNER_ID);
    }

    @Test
    @DisplayName("getFarmsByFarmer: returns an empty list when the farmer has no farm")
    void getFarmsByFarmer_NoFarms_ReturnsEmptyList() {
        when(farmRepository.findByFarmerIdOrderByCreatedAtDesc(OWNER_ID)).thenReturn(List.of());

        assertThat(farmService.getFarmsByFarmer(OWNER_ID)).isEmpty();
    }

    // --------------------------------------------------------------- getFarmById

    @Test
    @DisplayName("getFarmById: owner gets the farm")
    void getFarmById_Owner_ReturnsFarm() {
        when(farmRepository.findById(FARM_ID)).thenReturn(Optional.of(ownedFarm));

        FarmResponse response = farmService.getFarmById(FARM_ID, OWNER_ID);

        assertThat(response.getId()).isEqualTo(FARM_ID);
        assertThat(response.getName()).isEqualTo("Green Valley Farm");
    }

    @Test
    @DisplayName("getFarmById: unknown id throws ResourceNotFoundException")
    void getFarmById_NotFound_Throws() {
        when(farmRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> farmService.getFarmById(999L, OWNER_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Farm not found");
    }

    @Test
    @DisplayName("getFarmById: another farmer's farm throws ForbiddenException (data isolation)")
    void getFarmById_OtherFarmer_ThrowsForbidden() {
        when(farmRepository.findById(FARM_ID)).thenReturn(Optional.of(ownedFarm));

        assertThatThrownBy(() -> farmService.getFarmById(FARM_ID, OTHER_ID))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Data Isolation Violation");
    }

    @Test
    @DisplayName("getFarmById: a farm without owner is never accessible")
    void getFarmById_FarmWithoutOwner_ThrowsForbidden() {
        ownedFarm.setFarmer(null);
        when(farmRepository.findById(FARM_ID)).thenReturn(Optional.of(ownedFarm));

        assertThatThrownBy(() -> farmService.getFarmById(FARM_ID, OWNER_ID))
                .isInstanceOf(ForbiddenException.class);
    }

    // ---------------------------------------------------------------- updateFarm

    @Test
    @DisplayName("updateFarm: owner can update, fields are changed and trimmed, farm is saved")
    void updateFarm_Owner_SavesChanges() {
        when(farmRepository.findById(FARM_ID)).thenReturn(Optional.of(ownedFarm));
        when(farmRepository.save(any(Farm.class))).thenAnswer(inv -> inv.getArgument(0));

        FarmResponse response = farmService.updateFarm(FARM_ID, OWNER_ID, validUpdateRequest());

        assertThat(response.getName()).isEqualTo("Green Valley Organic");
        assertThat(response.getType()).isEqualTo(FarmType.MIXED);
        assertThat(response.getSize()).isEqualTo(40.5);
        assertThat(response.getSizeUnit()).isEqualTo(SizeUnit.ACRES);
        assertThat(response.getStatus()).isEqualTo(FarmStatus.INACTIVE);
        assertThat(response.getRegion()).isEqualTo("Centre");
        assertThat(response.getDistrict()).isEqualTo("Mfoundi");

        assertThat(ownedFarm.getName()).isEqualTo("Green Valley Organic");
        verify(farmRepository).save(ownedFarm);
    }

    @Test
    @DisplayName("updateFarm: unknown farm throws ResourceNotFoundException and nothing is saved")
    void updateFarm_NotFound_Throws() {
        when(farmRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> farmService.updateFarm(999L, OWNER_ID, validUpdateRequest()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Farm not found");

        verify(farmRepository, never()).save(any(Farm.class));
    }

    @Test
    @DisplayName("updateFarm: another farmer cannot update the farm and the farm stays unchanged")
    void updateFarm_OtherFarmer_ThrowsForbidden_AndDoesNotSave() {
        when(farmRepository.findById(FARM_ID)).thenReturn(Optional.of(ownedFarm));

        assertThatThrownBy(() -> farmService.updateFarm(FARM_ID, OTHER_ID, validUpdateRequest()))
                .isInstanceOf(ForbiddenException.class);

        assertThat(ownedFarm.getName()).isEqualTo("Green Valley Farm");
        verify(farmRepository, never()).save(any(Farm.class));
    }
}