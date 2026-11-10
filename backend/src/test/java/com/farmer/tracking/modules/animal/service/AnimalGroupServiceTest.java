package com.farmer.tracking.modules.animal.service;

import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.ForbiddenException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.animal.dto.AnimalGroupResponse;
import com.farmer.tracking.modules.animal.dto.CreateAnimalGroupRequest;
import com.farmer.tracking.modules.animal.dto.UpdateAnimalGroupRequest;
import com.farmer.tracking.modules.animal.model.AnimalGroup;
import com.farmer.tracking.modules.animal.model.AnimalGroupStatus;
import com.farmer.tracking.modules.animal.model.AnimalType;
import com.farmer.tracking.modules.animal.repository.AnimalGroupRepository;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.farm.model.Farm;
import com.farmer.tracking.modules.farm.repository.FarmRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnimalGroupServiceTest {

    @Mock
    private AnimalGroupRepository animalGroupRepository;

    @Mock
    private FarmerRepository farmerRepository;

    @Mock
    private FarmRepository farmRepository;

    private AnimalGroupServiceImpl service;

    private static final Long OWNER_ID = 1L;
    private static final Long OTHER_ID = 2L;
    private static final Long GROUP_ID = 10L;
    private static final Long FARM_ID = 5L;

    private Farmer owner;
    private Farmer otherFarmer;
    private Farm farm;
    private AnimalGroup ownedGroup;

    @BeforeEach
    void setUp() {
        service = new AnimalGroupServiceImpl(animalGroupRepository, farmerRepository, farmRepository);

        owner = new Farmer();
        owner.setId(OWNER_ID);
        owner.setEmailOrPhone("joyce@example.com");
        owner.setFullName("Joyce Muthoni");

        otherFarmer = new Farmer();
        otherFarmer.setId(OTHER_ID);
        otherFarmer.setEmailOrPhone("other@example.com");

        farm = new Farm();
        farm.setId(FARM_ID);
        farm.setName("Green Acres Farm");
        farm.setFarmer(owner);

        ownedGroup = new AnimalGroup();
        ownedGroup.setId(GROUP_ID);
        ownedGroup.setFarmer(owner);
        ownedGroup.setFarm(farm);
        ownedGroup.setName("Dairy Herd A");
        ownedGroup.setAnimalType(AnimalType.CATTLE);
        ownedGroup.setBreed("Holstein Friesian");
        ownedGroup.setInitialPopulation(30);
        ownedGroup.setCurrentPopulation(30);
        ownedGroup.setLocation("Barn 2");
        ownedGroup.setPurpose("Milk Production");
        ownedGroup.setStatus(AnimalGroupStatus.ACTIVE);
        ownedGroup.setStartDate(LocalDate.of(2026, 1, 15));
    }

    // -------------------------------------------------------------------------
    // Creation Tests (AC-01, AC-02, AC-10)
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("createAnimalGroup: saves valid group with owner and returns response")
    void createAnimalGroup_success() {
        CreateAnimalGroupRequest request = new CreateAnimalGroupRequest();
        request.setName("Poultry Flock 1");
        request.setAnimalType(AnimalType.POULTRY);
        request.setBreed("Kuroiler");
        request.setInitialPopulation(100);
        request.setCurrentPopulation(100);
        request.setLocation("Coop A");
        request.setPurpose("Egg Production");
        request.setFarmId(FARM_ID);

        when(farmerRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        when(farmRepository.findByIdAndFarmerId(FARM_ID, OWNER_ID)).thenReturn(Optional.of(farm));
        when(animalGroupRepository.save(any(AnimalGroup.class))).thenAnswer(inv -> {
            AnimalGroup g = inv.getArgument(0);
            g.setId(20L);
            return g;
        });

        AnimalGroupResponse res = service.createAnimalGroup(OWNER_ID, request);

        assertThat(res).isNotNull();
        assertThat(res.getId()).isEqualTo(20L);
        assertThat(res.getName()).isEqualTo("Poultry Flock 1");
        assertThat(res.getAnimalType()).isEqualTo(AnimalType.POULTRY);
        assertThat(res.getBreed()).isEqualTo("Kuroiler");
        assertThat(res.getInitialPopulation()).isEqualTo(100);
        assertThat(res.getCurrentPopulation()).isEqualTo(100);
        assertThat(res.getFarmerId()).isEqualTo(OWNER_ID);
        assertThat(res.getFarmName()).isEqualTo("Green Acres Farm");
        assertThat(res.getStatus()).isEqualTo(AnimalGroupStatus.ACTIVE);

        verify(animalGroupRepository).save(any(AnimalGroup.class));
    }

    @Test
    @DisplayName("createAnimalGroup: defaults currentPopulation to initialPopulation when omitted")
    void createAnimalGroup_defaultsCurrentPopulation() {
        CreateAnimalGroupRequest request = new CreateAnimalGroupRequest();
        request.setName("Boer Goats");
        request.setAnimalType(AnimalType.GOATS);
        request.setInitialPopulation(15);
        request.setCurrentPopulation(null); // omitted

        when(farmerRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        when(animalGroupRepository.save(any(AnimalGroup.class))).thenAnswer(inv -> {
            AnimalGroup g = inv.getArgument(0);
            g.setId(21L);
            return g;
        });

        AnimalGroupResponse res = service.createAnimalGroup(OWNER_ID, request);

        assertThat(res.getInitialPopulation()).isEqualTo(15);
        assertThat(res.getCurrentPopulation()).isEqualTo(15);
    }

    @Test
    @DisplayName("createAnimalGroup: throws BadRequestException when initial population is non-positive")
    void createAnimalGroup_rejectsNonPositiveInitialPopulation() {
        CreateAnimalGroupRequest request = new CreateAnimalGroupRequest();
        request.setName("Invalid Herd");
        request.setAnimalType(AnimalType.CATTLE);
        request.setInitialPopulation(0);

        when(farmerRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));

        assertThatThrownBy(() -> service.createAnimalGroup(OWNER_ID, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Initial population must be greater than zero");

        verify(animalGroupRepository, never()).save(any());
    }

    @Test
    @DisplayName("createAnimalGroup: throws BadRequestException when current population is negative")
    void createAnimalGroup_rejectsNegativeCurrentPopulation() {
        CreateAnimalGroupRequest request = new CreateAnimalGroupRequest();
        request.setName("Invalid Herd");
        request.setAnimalType(AnimalType.CATTLE);
        request.setInitialPopulation(10);
        request.setCurrentPopulation(-3);

        when(farmerRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));

        assertThatThrownBy(() -> service.createAnimalGroup(OWNER_ID, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Current population cannot be negative");

        verify(animalGroupRepository, never()).save(any());
    }

    @Test
    @DisplayName("createAnimalGroup: throws ResourceNotFoundException if farmer does not exist")
    void createAnimalGroup_farmerNotFound() {
        CreateAnimalGroupRequest request = new CreateAnimalGroupRequest();
        request.setName("Flock");
        request.setAnimalType(AnimalType.POULTRY);
        request.setInitialPopulation(10);

        when(farmerRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.createAnimalGroup(999L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // -------------------------------------------------------------------------
    // Listing & Details Tests (AC-03, AC-04, AC-05, AC-07)
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("getAnimalGroupsByFarmer: returns list of owned groups")
    void getAnimalGroupsByFarmer_returnsGroups() {
        when(animalGroupRepository.findByFarmerIdOrderByCreatedAtDesc(OWNER_ID))
                .thenReturn(List.of(ownedGroup));

        List<AnimalGroupResponse> result = service.getAnimalGroupsByFarmer(OWNER_ID);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(GROUP_ID);
        assertThat(result.get(0).getName()).isEqualTo("Dairy Herd A");
    }

    @Test
    @DisplayName("getAnimalGroupsByFarmer: returns empty list when farmer has no groups (empty state AC-04)")
    void getAnimalGroupsByFarmer_returnsEmptyState() {
        when(animalGroupRepository.findByFarmerIdOrderByCreatedAtDesc(OWNER_ID))
                .thenReturn(List.of());

        List<AnimalGroupResponse> result = service.getAnimalGroupsByFarmer(OWNER_ID);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getAnimalGroupById: returns details for owned group")
    void getAnimalGroupById_success() {
        when(animalGroupRepository.findById(GROUP_ID)).thenReturn(Optional.of(ownedGroup));

        AnimalGroupResponse res = service.getAnimalGroupById(GROUP_ID, OWNER_ID);

        assertThat(res).isNotNull();
        assertThat(res.getId()).isEqualTo(GROUP_ID);
        assertThat(res.getBreed()).isEqualTo("Holstein Friesian");
        assertThat(res.getLocation()).isEqualTo("Barn 2");
    }

    @Test
    @DisplayName("getAnimalGroupById: throws ForbiddenException when accessed by another farmer (AC-07 data isolation)")
    void getAnimalGroupById_forbiddenForOtherFarmer() {
        when(animalGroupRepository.findById(GROUP_ID)).thenReturn(Optional.of(ownedGroup));

        assertThatThrownBy(() -> service.getAnimalGroupById(GROUP_ID, OTHER_ID))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Data Isolation Violation");
    }

    @Test
    @DisplayName("getAnimalGroupById: throws ResourceNotFoundException when group does not exist")
    void getAnimalGroupById_notFound() {
        when(animalGroupRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getAnimalGroupById(999L, OWNER_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // -------------------------------------------------------------------------
    // Update Tests (AC-06, AC-07)
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("updateAnimalGroup: persists valid changes and returns updated response")
    void updateAnimalGroup_success() {
        UpdateAnimalGroupRequest request = new UpdateAnimalGroupRequest();
        request.setName("Dairy Herd A — Milking Phase");
        request.setAnimalType(AnimalType.CATTLE);
        request.setBreed("Holstein Friesian");
        request.setCurrentPopulation(28); // 2 transferred/culled
        request.setLocation("Barn 2 — East Section");
        request.setPurpose("Commercial Dairy");
        request.setStatus(AnimalGroupStatus.ACTIVE);

        when(animalGroupRepository.findById(GROUP_ID)).thenReturn(Optional.of(ownedGroup));
        when(animalGroupRepository.save(any(AnimalGroup.class))).thenAnswer(inv -> inv.getArgument(0));

        AnimalGroupResponse res = service.updateAnimalGroup(GROUP_ID, OWNER_ID, request);

        assertThat(res.getName()).isEqualTo("Dairy Herd A — Milking Phase");
        assertThat(res.getCurrentPopulation()).isEqualTo(28);
        assertThat(res.getLocation()).isEqualTo("Barn 2 — East Section");
        assertThat(res.getPurpose()).isEqualTo("Commercial Dairy");

        verify(animalGroupRepository).save(ownedGroup);
    }

    @Test
    @DisplayName("updateAnimalGroup: throws ForbiddenException when updating group of another farmer")
    void updateAnimalGroup_forbiddenForOtherFarmer() {
        UpdateAnimalGroupRequest request = new UpdateAnimalGroupRequest();
        request.setName("Hacked Name");
        request.setAnimalType(AnimalType.CATTLE);
        request.setCurrentPopulation(10);

        when(animalGroupRepository.findById(GROUP_ID)).thenReturn(Optional.of(ownedGroup));

        assertThatThrownBy(() -> service.updateAnimalGroup(GROUP_ID, OTHER_ID, request))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Data Isolation Violation");

        verify(animalGroupRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateAnimalGroup: rejects negative current population")
    void updateAnimalGroup_rejectsNegativePopulation() {
        UpdateAnimalGroupRequest request = new UpdateAnimalGroupRequest();
        request.setName("Updated");
        request.setAnimalType(AnimalType.CATTLE);
        request.setCurrentPopulation(-5);

        when(animalGroupRepository.findById(GROUP_ID)).thenReturn(Optional.of(ownedGroup));

        assertThatThrownBy(() -> service.updateAnimalGroup(GROUP_ID, OWNER_ID, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Current population cannot be negative");
    }

    // -------------------------------------------------------------------------
    // Deletion Tests (AC-08, AC-09)
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("deleteAnimalGroup: deletes group successfully when no protected historical records exist (AC-08)")
    void deleteAnimalGroup_success() {
        when(animalGroupRepository.findById(GROUP_ID)).thenReturn(Optional.of(ownedGroup));

        service.deleteAnimalGroup(GROUP_ID, OWNER_ID);

        verify(animalGroupRepository).delete(ownedGroup);
    }

    @Test
    @DisplayName("deleteAnimalGroup: blocks deletion with ConflictException when protected historical records exist (AC-09)")
    void deleteAnimalGroup_protectsHistoricalRecords() {
        ownedGroup.setStatus(AnimalGroupStatus.ARCHIVED);
        ownedGroup.setNotes("Archived with official production logs [PROTECTED]");

        when(animalGroupRepository.findById(GROUP_ID)).thenReturn(Optional.of(ownedGroup));

        assertThatThrownBy(() -> service.deleteAnimalGroup(GROUP_ID, OWNER_ID))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("protected historical records");

        verify(animalGroupRepository, never()).delete(any());
    }

    @Test
    @DisplayName("deleteAnimalGroup: throws ForbiddenException when deleting another farmer's group")
    void deleteAnimalGroup_forbiddenForOtherFarmer() {
        when(animalGroupRepository.findById(GROUP_ID)).thenReturn(Optional.of(ownedGroup));

        assertThatThrownBy(() -> service.deleteAnimalGroup(GROUP_ID, OTHER_ID))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Data Isolation Violation");

        verify(animalGroupRepository, never()).delete(any());
    }
}

