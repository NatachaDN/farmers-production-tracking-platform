package com.farmer.tracking.modules.farm;

import com.farmer.tracking.common.exception.ForbiddenException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.auth.model.FarmType;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.farm.dto.CreateFarmRequest;
import com.farmer.tracking.modules.farm.dto.FarmResponse;
import com.farmer.tracking.modules.farm.dto.UpdateFarmRequest;
import com.farmer.tracking.modules.farm.mapper.FarmMapper;
import com.farmer.tracking.modules.farm.model.*;
import com.farmer.tracking.modules.farm.repository.FarmRepository;
import com.farmer.tracking.modules.farm.service.FarmServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FarmServiceTest {

    @Mock
    private FarmRepository farmRepository;

    @Mock
    private FarmerRepository farmerRepository;

    private FarmMapper farmMapper;
    private FarmServiceImpl farmService;

    private Farmer farmer1;
    private Farmer farmer2;

    @BeforeEach
    void setUp() {
        farmMapper = new FarmMapper();
        farmService = new FarmServiceImpl(farmRepository, farmerRepository, farmMapper);

        farmer1 = new Farmer();
        farmer1.setId(1L);
        farmer1.setFullName("Natacha Maurelle");
        farmer1.setEmailOrPhone("natacha@example.com");

        farmer2 = new Farmer();
        farmer2.setId(2L);
        farmer2.setFullName("Joyce Lesley");
        farmer2.setEmailOrPhone("joyce@example.com");
    }

    @Test
    void createFarm_Success() {
        CreateFarmRequest request = new CreateFarmRequest(
                "Green Valley Farm",
                FarmType.CROP,
                25.0,
                SizeUnit.HECTARES,
                "Main farm for maize and beans",
                FarmStatus.ACTIVE,
                "Cameroon",
                "West",
                "Bafoussam"
        );
        request.setSoilType(SoilType.LOAMY);
        request.setSlope(SlopeType.MODERATE);
        request.setAccessToWater(AccessToWater.YES);

        Farm savedFarm = new Farm();
        savedFarm.setId(10L);
        savedFarm.setFarmer(farmer1);
        savedFarm.setName("Green Valley Farm");
        savedFarm.setType(FarmType.CROP);
        savedFarm.setSize(25.0);
        savedFarm.setSizeUnit(SizeUnit.HECTARES);
        savedFarm.setDescription("Main farm for maize and beans");
        savedFarm.setStatus(FarmStatus.ACTIVE);
        savedFarm.setCountry("Cameroon");
        savedFarm.setRegion("West");
        savedFarm.setDistrict("Bafoussam");

        when(farmerRepository.findById(1L)).thenReturn(Optional.of(farmer1));
        when(farmRepository.save(any(Farm.class))).thenReturn(savedFarm);

        FarmResponse response = farmService.createFarm(1L, request);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("Green Valley Farm", response.getName());
        assertEquals(1L, response.getFarmerId());
        assertEquals("Natacha Maurelle", response.getFarmerName());
        verify(farmRepository, times(1)).save(any(Farm.class));
    }

    @Test
    void getFarmsByFarmer_Success() {
        Farm farm = new Farm();
        farm.setId(10L);
        farm.setFarmer(farmer1);
        farm.setName("Green Valley Farm");
        farm.setType(FarmType.CROP);
        farm.setSize(25.0);
        farm.setSizeUnit(SizeUnit.HECTARES);
        farm.setStatus(FarmStatus.ACTIVE);
        farm.setCountry("Cameroon");
        farm.setRegion("West");
        farm.setDistrict("Bafoussam");

        when(farmRepository.findByFarmerIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(farm));

        List<FarmResponse> farms = farmService.getFarmsByFarmer(1L);

        assertEquals(1, farms.size());
        assertEquals("Green Valley Farm", farms.get(0).getName());
    }

    @Test
    void getFarmById_Success_WhenOwnerMatches() {
        Farm farm = new Farm();
        farm.setId(10L);
        farm.setFarmer(farmer1);
        farm.setName("Green Valley Farm");
        farm.setType(FarmType.CROP);
        farm.setSize(25.0);
        farm.setSizeUnit(SizeUnit.HECTARES);
        farm.setStatus(FarmStatus.ACTIVE);
        farm.setCountry("Cameroon");
        farm.setRegion("West");
        farm.setDistrict("Bafoussam");

        when(farmRepository.findById(10L)).thenReturn(Optional.of(farm));

        FarmResponse response = farmService.getFarmById(10L, 1L);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("Green Valley Farm", response.getName());
    }

    @Test
    void getFarmById_ThrowsForbidden_WhenOwnerDoesNotMatch() {
        Farm farm = new Farm();
        farm.setId(10L);
        farm.setFarmer(farmer1);

        when(farmRepository.findById(10L)).thenReturn(Optional.of(farm));

        assertThrows(ForbiddenException.class, () -> farmService.getFarmById(10L, 2L));
    }

    @Test
    void updateFarm_Success_WhenOwnerMatches() {
        Farm farm = new Farm();
        farm.setId(10L);
        farm.setFarmer(farmer1);
        farm.setName("Old Valley Farm");
        farm.setType(FarmType.CROP);
        farm.setSize(20.0);
        farm.setSizeUnit(SizeUnit.HECTARES);
        farm.setStatus(FarmStatus.ACTIVE);
        farm.setCountry("Cameroon");
        farm.setRegion("West");
        farm.setDistrict("Bafoussam");

        UpdateFarmRequest updateReq = new UpdateFarmRequest();
        updateReq.setName("Green Valley Farm Updated");
        updateReq.setType(FarmType.MIXED);
        updateReq.setSize(30.0);
        updateReq.setSizeUnit(SizeUnit.HECTARES);
        updateReq.setStatus(FarmStatus.ACTIVE);
        updateReq.setCountry("Cameroon");
        updateReq.setRegion("West");
        updateReq.setDistrict("Bafoussam");

        when(farmRepository.findById(10L)).thenReturn(Optional.of(farm));
        when(farmRepository.save(any(Farm.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FarmResponse updatedResponse = farmService.updateFarm(10L, 1L, updateReq);

        assertNotNull(updatedResponse);
        assertEquals("Green Valley Farm Updated", updatedResponse.getName());
        assertEquals(30.0, updatedResponse.getSize());
        assertEquals(FarmType.MIXED, updatedResponse.getType());
    }

    @Test
    void updateFarm_ThrowsResourceNotFound_WhenFarmDoesNotExist() {
        UpdateFarmRequest updateReq = new UpdateFarmRequest();
        updateReq.setName("Test Farm");

        when(farmRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> farmService.updateFarm(99L, 1L, updateReq));
    }
}
