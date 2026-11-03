package com.farmer.tracking.modules.crop.service;

import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.exception.UnauthorizedException;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.crop.api.CycleCostSummaryResponse;
import com.farmer.tracking.modules.crop.api.CycleInputUsageRequest;
import com.farmer.tracking.modules.crop.api.CycleInputUsageResponse;
import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleInputUsage;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.repository.CycleInputUsageRepository;
import com.farmer.tracking.modules.crop.repository.CycleRepository;
import com.farmer.tracking.modules.input.entity.FarmInput;
import com.farmer.tracking.modules.input.entity.InputType;
import com.farmer.tracking.modules.input.repository.FarmInputRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CycleInputUsageServiceTest {

    @Mock
    private CycleInputUsageRepository cycleInputUsageRepository;

    @Mock
    private CycleRepository cycleRepository;

    @Mock
    private FarmInputRepository farmInputRepository;

    @InjectMocks
    private CycleInputUsageServiceImpl cycleInputUsageService;

    private final Long farmerId = 1L;
    private final Long cycleId = 10L;
    private final Long inputId = 20L;

    private Cycle activeCycle;
    private FarmInput sampleInput;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();

        activeCycle = new Cycle();
        activeCycle.setId(cycleId);
        activeCycle.setFarmerId(farmerId);
        activeCycle.setName("Maize — Plot A");
        activeCycle.setCropName("Maize");
        activeCycle.setStatus(CycleStatus.ACTIVE);

        sampleInput = new FarmInput();
        sampleInput.setId(inputId);
        sampleInput.setFarmerId(farmerId);
        sampleInput.setName("CAN Fertilizer");
        sampleInput.setType(InputType.FERTILIZER);
        sampleInput.setQuantity(200.0); // 200 kg available in stock
        sampleInput.setUnit("kg");
        sampleInput.setPurchasePrice(160.0); // 160 per kg
        sampleInput.setCumulativeCost(32000.0);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(Long id, String role) {
        UserPrincipal principal = new UserPrincipal(id, "farmer@example.com", "pass", List.of(new SimpleGrantedAuthority(role)));
        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(token);
    }

    @Test
    @DisplayName("AC1: Links input consumption to active cycle and deducts quantity from available stock")
    void recordInputUsage_Success_DeductsStockAndCalculatesRealCost() {
        CycleInputUsageRequest request = new CycleInputUsageRequest(inputId, 50.0, LocalDate.of(2026, 10, 15), "Applied along rows");

        when(cycleRepository.findById(cycleId)).thenReturn(Optional.of(activeCycle));
        when(farmInputRepository.findByIdAndFarmerId(inputId, farmerId)).thenReturn(Optional.of(sampleInput));

        when(cycleInputUsageRepository.save(any(CycleInputUsage.class))).thenAnswer(invocation -> {
            CycleInputUsage u = invocation.getArgument(0);
            u.setId(100L);
            u.setCreatedAt(LocalDateTime.now());
            return u;
        });

        CycleInputUsageResponse response = cycleInputUsageService.recordInputUsage(farmerId, cycleId, request);

        // Verify consumption record returned
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getCycleId()).isEqualTo(cycleId);
        assertThat(response.getInputId()).isEqualTo(inputId);
        assertThat(response.getInputName()).isEqualTo("CAN Fertilizer");
        assertThat(response.getQuantityUsed()).isEqualTo(50.0);
        assertThat(response.getUnitPrice()).isEqualTo(160.0);
        assertThat(response.getTotalCost()).isEqualTo(8000.0); // 50 * 160 = 8000
        assertThat(response.getRemainingStock()).isEqualTo(150.0); // 200 - 50 = 150

        // Verify stock deducted in repository
        assertThat(sampleInput.getQuantity()).isEqualTo(150.0);
        verify(farmInputRepository).save(sampleInput);
        verify(cycleInputUsageRepository).save(any(CycleInputUsage.class));
    }

    @Test
    @DisplayName("AC2: System warns of insufficient stock when used quantity exceeds available stock")
    void recordInputUsage_Fails_WhenQuantityExceedsAvailableStock() {
        // Requesting 250 kg when only 200 kg is in stock
        CycleInputUsageRequest request = new CycleInputUsageRequest(inputId, 250.0, LocalDate.now(), "Too much fertilizer");

        when(cycleRepository.findById(cycleId)).thenReturn(Optional.of(activeCycle));
        when(farmInputRepository.findByIdAndFarmerId(inputId, farmerId)).thenReturn(Optional.of(sampleInput));

        assertThatThrownBy(() -> cycleInputUsageService.recordInputUsage(farmerId, cycleId, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Insufficient stock")
                .hasMessageContaining("Available stock for 'CAN Fertilizer' is 200.00 kg, but 250.00 kg was requested.");

        // Stock should NOT have changed
        assertThat(sampleInput.getQuantity()).isEqualTo(200.0);
        verify(farmInputRepository, never()).save(any(FarmInput.class));
        verify(cycleInputUsageRepository, never()).save(any(CycleInputUsage.class));
    }

    @Test
    @DisplayName("recordInputUsage - Fails when cycle is not ACTIVE (e.g. COMPLETED)")
    void recordInputUsage_Fails_WhenCycleNotActive() {
        activeCycle.setStatus(CycleStatus.COMPLETED);

        CycleInputUsageRequest request = new CycleInputUsageRequest(inputId, 30.0, LocalDate.now(), null);

        when(cycleRepository.findById(cycleId)).thenReturn(Optional.of(activeCycle));

        assertThatThrownBy(() -> cycleInputUsageService.recordInputUsage(farmerId, cycleId, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Input consumption can only be recorded for an ACTIVE cycle");

        verify(farmInputRepository, never()).save(any());
        verify(cycleInputUsageRepository, never()).save(any());
    }

    @Test
    @DisplayName("recordInputUsage - Fails when quantity is zero or negative")
    void recordInputUsage_Fails_WhenZeroOrNegativeQuantity() {
        CycleInputUsageRequest request = new CycleInputUsageRequest(inputId, -5.0, LocalDate.now(), null);

        when(cycleRepository.findById(cycleId)).thenReturn(Optional.of(activeCycle));

        assertThatThrownBy(() -> cycleInputUsageService.recordInputUsage(farmerId, cycleId, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Quantity used must be greater than 0");
    }

    @Test
    @DisplayName("recordInputUsage - Fails when cycle not found")
    void recordInputUsage_Fails_WhenCycleNotFound() {
        CycleInputUsageRequest request = new CycleInputUsageRequest(inputId, 10.0, LocalDate.now(), null);

        when(cycleRepository.findById(cycleId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cycleInputUsageService.recordInputUsage(farmerId, cycleId, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Cycle not found");
    }

    @Test
    @DisplayName("Security: Unauthorized when accessing another farmer's cycle")
    void recordInputUsage_UnauthorizedCrossFarmer() {
        authenticateAs(999L, "ROLE_FARMER");

        CycleInputUsageRequest request = new CycleInputUsageRequest(inputId, 10.0, LocalDate.now(), null);

        assertThatThrownBy(() -> cycleInputUsageService.recordInputUsage(farmerId, cycleId, request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Access denied");

        verify(cycleRepository, never()).findById(any());
    }

    @Test
    @DisplayName("getCycleCostSummary - Calculates real cost summary and breakdown by type")
    void getCycleCostSummary_Success() {
        CycleInputUsage u1 = new CycleInputUsage(farmerId, activeCycle, sampleInput, "CAN Fertilizer",
                InputType.FERTILIZER, 50.0, "kg", 160.0, 8000.0, LocalDate.now(), "Fertilizing");
        u1.setId(1L);

        FarmInput seedInput = new FarmInput(farmerId, "Hybrid Maize 614", InputType.SEEDS, 50.0, "kg", LocalDate.now(), 500.0, 25000.0);
        CycleInputUsage u2 = new CycleInputUsage(farmerId, activeCycle, seedInput, "Hybrid Maize 614",
                InputType.SEEDS, 25.0, "kg", 500.0, 12500.0, LocalDate.now(), "Planting seeds");
        u2.setId(2L);

        when(cycleRepository.findById(cycleId)).thenReturn(Optional.of(activeCycle));
        when(cycleInputUsageRepository.findByCycleIdAndFarmerIdOrderByUsageDateDesc(cycleId, farmerId))
                .thenReturn(List.of(u1, u2));

        CycleCostSummaryResponse summary = cycleInputUsageService.getCycleCostSummary(farmerId, cycleId);

        assertThat(summary).isNotNull();
        assertThat(summary.getCycleId()).isEqualTo(cycleId);
        assertThat(summary.getTotalInputCost()).isEqualTo(20500.0); // 8000 + 12500
        assertThat(summary.getInputCount()).isEqualTo(2);
        assertThat(summary.getCostByType()).containsEntry("FERTILIZER", 8000.0);
        assertThat(summary.getCostByType()).containsEntry("SEEDS", 12500.0);
        assertThat(summary.getItems()).hasSize(2);
    }

    @Test
    @DisplayName("deleteInputUsage - Restores deducted stock back to inventory and deletes usage")
    void deleteInputUsage_RestoresStock() {
        CycleInputUsage usage = new CycleInputUsage(farmerId, activeCycle, sampleInput, "CAN Fertilizer",
                InputType.FERTILIZER, 50.0, "kg", 160.0, 8000.0, LocalDate.now(), "Fertilizing");
        usage.setId(100L);

        // Before delete, inventory had 150 kg
        sampleInput.setQuantity(150.0);

        when(cycleInputUsageRepository.findByIdAndFarmerId(100L, farmerId)).thenReturn(Optional.of(usage));

        cycleInputUsageService.deleteInputUsage(farmerId, cycleId, 100L);

        // Stock restored: 150 + 50 = 200 kg
        assertThat(sampleInput.getQuantity()).isEqualTo(200.0);
        verify(farmInputRepository).save(sampleInput);
        verify(cycleInputUsageRepository).delete(usage);
    }
}
