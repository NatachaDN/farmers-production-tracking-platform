package com.farmer.tracking.modules.manager.service;

import com.farmer.tracking.common.audit.AuditEvent;
import com.farmer.tracking.common.audit.AuditEventRepository;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.animal.model.AnimalGroup;
import com.farmer.tracking.modules.animal.repository.AnimalGroupRepository;
import com.farmer.tracking.modules.auth.model.FarmType;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.model.RegistrationStatus;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.crop.entity.*;
import com.farmer.tracking.modules.crop.repository.CycleIncidentRepository;
import com.farmer.tracking.modules.crop.repository.CycleRepository;
import com.farmer.tracking.modules.crop.repository.HarvestRepository;
import com.farmer.tracking.modules.farm.model.Farm;
import com.farmer.tracking.modules.farm.repository.FarmRepository;
import com.farmer.tracking.modules.input.repository.FarmInputRepository;
import com.farmer.tracking.modules.manager.dto.ManagerDtos.*;
import com.farmer.tracking.modules.plot.entity.Plot;
import com.farmer.tracking.modules.plot.repository.PlotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ManagerServiceTest {

    @Mock
    private FarmerRepository farmerRepository;

    @Mock
    private FarmRepository farmRepository;

    @Mock
    private PlotRepository plotRepository;

    @Mock
    private CycleRepository cycleRepository;

    @Mock
    private HarvestRepository harvestRepository;

    @Mock
    private CycleIncidentRepository incidentRepository;

    @Mock
    private FarmInputRepository inputRepository;

    @Mock
    private AnimalGroupRepository animalGroupRepository;

    @Mock
    private AuditEventRepository auditEventRepository;

    private ManagerServiceImpl managerService;

    private Farmer approvedFarmer;
    private Farmer pendingFarmer;
    private Farm testFarm;
    private Plot testPlot;
    private Cycle testCycle;
    private Harvest testHarvest;
    private CycleIncident testIncident;
    private AnimalGroup testAnimalGroup;

    @BeforeEach
    void setUp() {
        managerService = new ManagerServiceImpl(
                farmerRepository,
                farmRepository,
                plotRepository,
                cycleRepository,
                harvestRepository,
                incidentRepository,
                inputRepository,
                animalGroupRepository,
                auditEventRepository
        );

        approvedFarmer = new Farmer();
        approvedFarmer.setId(1L);
        approvedFarmer.setFullName("Joyce Muthoni");
        approvedFarmer.setEmailOrPhone("joyce@example.com");
        approvedFarmer.setLocation("Nakuru East, Rift Valley");
        approvedFarmer.setFarmType(FarmType.CROP);
        approvedFarmer.setStatus(RegistrationStatus.APPROVED);
        approvedFarmer.setCreatedAt(LocalDateTime.now().minusMonths(3));

        pendingFarmer = new Farmer();
        pendingFarmer.setId(2L);
        pendingFarmer.setFullName("Kofi Mensah");
        pendingFarmer.setEmailOrPhone("kofi@example.com");
        pendingFarmer.setLocation("Sunyani, Bono Region");
        pendingFarmer.setFarmType(FarmType.MIXED);
        pendingFarmer.setStatus(RegistrationStatus.PENDING);
        pendingFarmer.setCreatedAt(LocalDateTime.now().minusDays(2));

        testFarm = new Farm();
        testFarm.setId(10L);
        testFarm.setName("Green Valley Farm");
        testFarm.setFarmer(approvedFarmer);
        testFarm.setRegion("Nakuru");
        testFarm.setDistrict("Nakuru East");
        testFarm.setCountry("Kenya");
        testFarm.setSize(12.5);

        testPlot = new Plot();
        testPlot.setId(20L);
        testPlot.setName("Plot North");
        testPlot.setFarmerId(1L);
        testPlot.setFarm(testFarm);
        testPlot.setArea(5.0);
        testPlot.setCropType("Yellow Maize");

        testCycle = new Cycle();
        testCycle.setId(40L);
        testCycle.setName("Maize Season 2026-A");
        testCycle.setFarmerId(1L);
        testCycle.setPlot(testPlot);
        testCycle.setCropName("Yellow Maize");
        testCycle.setStatus(CycleStatus.ACTIVE);
        testCycle.setStartDate(LocalDate.now().minusMonths(1));
        testCycle.setExpectedQuantity(2500.0);
        testCycle.setAcreage(5.0);

        testHarvest = new Harvest();
        testHarvest.setId(50L);
        testHarvest.setCycle(testCycle);
        testHarvest.setQuantity(1800.0);
        testHarvest.setUnit(HarvestUnit.KG);
        testHarvest.setHarvestDate(LocalDate.now().minusDays(5));

        testIncident = new CycleIncident();
        testIncident.setId(60L);
        testIncident.setFarmerId(1L);
        testIncident.setCycle(testCycle);
        testIncident.setIncidentType(IncidentType.PEST);
        testIncident.setSeverityLevel(3);
        testIncident.setIncidentDate(LocalDate.now().minusDays(3));
        testIncident.setDescription("Fall armyworm sighted in sector B");

        testAnimalGroup = new AnimalGroup();
        testAnimalGroup.setId(70L);
        testAnimalGroup.setFarmer(approvedFarmer);
        testAnimalGroup.setCurrentPopulation(12);
        testAnimalGroup.setInitialPopulation(12);
    }

    @Test
    @DisplayName("US-33: getDashboardSummary aggregates indicators across all farmers")
    void getDashboardSummary_Success() {
        when(farmerRepository.findAll()).thenReturn(List.of(approvedFarmer, pendingFarmer));
        when(cycleRepository.findAll()).thenReturn(List.of(testCycle));
        when(harvestRepository.findAll()).thenReturn(List.of(testHarvest));
        when(plotRepository.findAll()).thenReturn(List.of(testPlot));
        when(animalGroupRepository.findAll()).thenReturn(List.of(testAnimalGroup));
        when(incidentRepository.findAll()).thenReturn(List.of(testIncident));

        ManagerDashboardSummary summary = managerService.getDashboardSummary();

        assertNotNull(summary);
        assertEquals(2, summary.totalFarmers());
        assertEquals(1, summary.approvedFarmers());
        assertEquals(1, summary.pendingFarmers());
        assertEquals(1, summary.activeCyclesCount());
        assertEquals(1800.0, summary.totalHarvestKg());
        assertEquals(1.8, summary.totalHarvestTons(), 0.001);
        assertEquals(1, summary.totalAnimalGroupsCount());
        assertEquals(12, summary.totalAnimalPopulation());
        assertEquals(1, summary.activeAlertsCount());
        assertEquals(1, summary.pendingRegistrations().size());
        assertEquals("Kofi Mensah", summary.pendingRegistrations().get(0).fullName());
    }

    @Test
    @DisplayName("US-31, US-32: getFarmers with filtering and sorting")
    void getFarmers_FilterAndSort() {
        when(farmerRepository.findAll()).thenReturn(List.of(approvedFarmer, pendingFarmer));
        when(plotRepository.findAll()).thenReturn(List.of(testPlot));
        when(cycleRepository.findAll()).thenReturn(List.of(testCycle));
        when(harvestRepository.findAll()).thenReturn(List.of(testHarvest));

        // 1. Filter by status PENDING
        List<ManagerFarmerRow> pendingList = managerService.getFarmers(null, null, null, RegistrationStatus.PENDING, "name");
        assertEquals(1, pendingList.size());
        assertEquals("Kofi Mensah", pendingList.get(0).fullName());

        // 2. Filter by search query "Joyce"
        List<ManagerFarmerRow> joyceList = managerService.getFarmers("Joyce", null, null, null, "name");
        assertEquals(1, joyceList.size());
        assertEquals("Joyce Muthoni", joyceList.get(0).fullName());
        assertEquals(1, joyceList.get(0).plotsCount());
        assertEquals(1, joyceList.get(0).activeCycles());
        assertEquals(1800.0, joyceList.get(0).harvestedKg());

        // 3. Filter by crop "Maize"
        List<ManagerFarmerRow> maizeList = managerService.getFarmers(null, null, "Maize", null, "name");
        assertEquals(1, maizeList.size());
        assertEquals("Joyce Muthoni", maizeList.get(0).fullName());

        // 4. Filter by region "Bono"
        List<ManagerFarmerRow> bonoList = managerService.getFarmers(null, "Bono", null, null, "name");
        assertEquals(1, bonoList.size());
        assertEquals("Kofi Mensah", bonoList.get(0).fullName());
    }

    @Test
    @DisplayName("US-33: getFarmerDetail returns detailed drill-down data")
    void getFarmerDetail_Success() {
        when(farmerRepository.findById(1L)).thenReturn(Optional.of(approvedFarmer));
        when(farmRepository.findByFarmerIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(testFarm));
        when(plotRepository.findByFarmerId(1L)).thenReturn(List.of(testPlot));
        when(cycleRepository.findByFarmerId(1L)).thenReturn(List.of(testCycle));
        when(harvestRepository.findByFarmerIdOrderByHarvestDateDesc(1L)).thenReturn(List.of(testHarvest));
        when(incidentRepository.findByCycleIdOrderByIncidentDateDesc(40L)).thenReturn(List.of(testIncident));
        when(animalGroupRepository.findByFarmerIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(testAnimalGroup));

        ManagerFarmerDetail detail = managerService.getFarmerDetail(1L);

        assertNotNull(detail);
        assertEquals("Joyce Muthoni", detail.farmer().fullName());
        assertEquals(1, detail.farms().size());
        assertEquals("Green Valley Farm", detail.farms().get(0).name());
        assertEquals(1, detail.plots().size());
        assertEquals(1, detail.cycles().size());
        assertEquals(1, detail.harvests().size());
        assertEquals(1, detail.incidents().size());
        assertEquals(1, detail.animalGroups().size());
    }

    @Test
    @DisplayName("getFarmerDetail throws ResourceNotFoundException when farmer does not exist")
    void getFarmerDetail_NotFound() {
        when(farmerRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> managerService.getFarmerDetail(999L));
    }

    @Test
    @DisplayName("US-34: updateFarmerStatus approves a pending registration")
    void updateFarmerStatus_Approve() {
        when(farmerRepository.findById(2L)).thenReturn(Optional.of(pendingFarmer));
        when(farmerRepository.save(any(Farmer.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(plotRepository.findAll()).thenReturn(List.of());
        when(cycleRepository.findAll()).thenReturn(List.of());
        when(harvestRepository.findAll()).thenReturn(List.of());

        UpdateFarmerStatusRequest req = new UpdateFarmerStatusRequest(RegistrationStatus.APPROVED, null);
        ManagerFarmerRow row = managerService.updateFarmerStatus(2L, req, "manager@coop.org");

        assertNotNull(row);
        assertEquals(RegistrationStatus.APPROVED, row.status());
        assertNull(row.rejectionReason());
        verify(farmerRepository).save(pendingFarmer);
        verify(auditEventRepository).save(any(AuditEvent.class));
    }

    @Test
    @DisplayName("US-34: updateFarmerStatus rejects a registration with explanatory reason")
    void updateFarmerStatus_Reject() {
        when(farmerRepository.findById(2L)).thenReturn(Optional.of(pendingFarmer));
        when(farmerRepository.save(any(Farmer.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(plotRepository.findAll()).thenReturn(List.of());
        when(cycleRepository.findAll()).thenReturn(List.of());
        when(harvestRepository.findAll()).thenReturn(List.of());

        UpdateFarmerStatusRequest req = new UpdateFarmerStatusRequest(RegistrationStatus.REJECTED, "Invalid national ID");
        ManagerFarmerRow row = managerService.updateFarmerStatus(2L, req, "manager@coop.org");

        assertNotNull(row);
        assertEquals(RegistrationStatus.REJECTED, row.status());
        assertEquals("Invalid national ID", row.rejectionReason());
        verify(farmerRepository).save(pendingFarmer);
        verify(auditEventRepository).save(any(AuditEvent.class));
    }

    @Test
    @DisplayName("US-35: generateConsolidatedReport generates multi-farmer report over period")
    void generateConsolidatedReport_Success() {
        when(farmerRepository.findAllById(List.of(1L))).thenReturn(List.of(approvedFarmer));
        when(plotRepository.findAll()).thenReturn(List.of(testPlot));
        when(cycleRepository.findAll()).thenReturn(List.of(testCycle));
        when(harvestRepository.findAll()).thenReturn(List.of(testHarvest));
        when(incidentRepository.findAll()).thenReturn(List.of(testIncident));
        when(inputRepository.findAll()).thenReturn(List.of());

        ConsolidatedReportRequest req = new ConsolidatedReportRequest(
                LocalDate.now().minusMonths(1),
                LocalDate.now().plusDays(1),
                List.of(1L),
                null,
                null
        );

        ConsolidatedReportResponse report = managerService.generateConsolidatedReport(req);

        assertNotNull(report);
        assertEquals(1, report.totalFarmersCount());
        assertEquals(1, report.totalActiveCycles());
        assertEquals(1800.0, report.totalYieldKg());
        assertEquals(1, report.cropBreakdown().size());
        assertEquals("Yellow Maize", report.cropBreakdown().get(0).cropName());
        assertEquals(1, report.farmerBreakdown().size());
        assertEquals("Joyce Muthoni", report.farmerBreakdown().get(0).farmerName());
    }

    @Test
    @DisplayName("US-35: exportConsolidatedReportCsv produces valid CSV string")
    void exportConsolidatedReportCsv_Success() {
        when(farmerRepository.findAllById(List.of(1L))).thenReturn(List.of(approvedFarmer));
        when(plotRepository.findAll()).thenReturn(List.of(testPlot));
        when(cycleRepository.findAll()).thenReturn(List.of(testCycle));
        when(harvestRepository.findAll()).thenReturn(List.of(testHarvest));
        when(incidentRepository.findAll()).thenReturn(List.of(testIncident));
        when(inputRepository.findAll()).thenReturn(List.of());

        ConsolidatedReportRequest req = new ConsolidatedReportRequest(
                LocalDate.now().minusMonths(1),
                LocalDate.now().plusDays(1),
                List.of(1L),
                null,
                null
        );

        String csv = managerService.exportConsolidatedReportCsv(req);

        assertNotNull(csv);
        assertTrue(csv.contains("ACREA PLATFORM — CONSOLIDATED PRODUCTION REPORT"));
        assertTrue(csv.contains("Joyce Muthoni"));
        assertTrue(csv.contains("Yellow Maize"));
    }
}
