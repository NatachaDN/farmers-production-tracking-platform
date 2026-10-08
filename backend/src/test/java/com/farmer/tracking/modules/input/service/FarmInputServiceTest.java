package com.farmer.tracking.modules.input.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.input.api.FarmInputRequest;
import com.farmer.tracking.modules.input.api.FarmInputResponse;
import com.farmer.tracking.modules.input.entity.FarmInput;
import com.farmer.tracking.modules.input.entity.InputType;
import com.farmer.tracking.modules.input.repository.FarmInputRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FarmInputServiceTest {

    @Mock
    private FarmInputRepository farmInputRepository;

    @InjectMocks
    private FarmInputServiceImpl farmInputService;

    private FarmInput seedsInput;
    private final Long farmerId = 1L;
    private final Long inputId = 10L;
    private final LocalDate purchaseDate = LocalDate.now().minusDays(5);

    @BeforeEach
    void setUp() {
        seedsInput = new FarmInput(
                farmerId, "Maize Seeds", InputType.SEEDS,
                50.0, "kg", purchaseDate, 4500.0, 4500.0
        );
        seedsInput.setId(inputId);
        seedsInput.setCreatedAt(LocalDateTime.now());
        seedsInput.setUpdatedAt(LocalDateTime.now());
    }

    // ------------------------------------------------------------------ //
    //  registerOrUpdateInput — new input                                   //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("Should register a new input when no existing input with same name")
    void shouldRegisterNewInput() {
        FarmInputRequest request = new FarmInputRequest(
                "Maize Seeds", InputType.SEEDS, 50.0, "kg", purchaseDate, 4500.0
        );

        when(farmInputRepository.findByFarmerIdAndNameIgnoreCase(farmerId, "Maize Seeds"))
                .thenReturn(Optional.empty());
        when(farmInputRepository.save(any(FarmInput.class))).thenReturn(seedsInput);

        FarmInputResponse response = farmInputService.registerOrUpdateInput(farmerId, request);

        assertThat(response.getId()).isEqualTo(inputId);
        assertThat(response.getName()).isEqualTo("Maize Seeds");
        assertThat(response.getQuantity()).isEqualTo(50.0);
        assertThat(response.getCumulativeCost()).isEqualTo(4500.0);
        verify(farmInputRepository).save(any(FarmInput.class));
    }

    @Test
    @DisplayName("Should update existing input: add stock and cumulative cost when same name exists")
    void shouldUpdateExistingInputWhenNameMatches() {
        FarmInputRequest request = new FarmInputRequest(
                "Maize Seeds", InputType.SEEDS, 25.0, "kg", purchaseDate, 2250.0
        );

        when(farmInputRepository.findByFarmerIdAndNameIgnoreCase(farmerId, "Maize Seeds"))
                .thenReturn(Optional.of(seedsInput));

        FarmInput updatedInput = new FarmInput(
                farmerId, "Maize Seeds", InputType.SEEDS,
                75.0, "kg", purchaseDate, 2250.0, 6750.0  // 50+25, 4500+2250
        );
        updatedInput.setId(inputId);
        updatedInput.setCreatedAt(LocalDateTime.now());
        updatedInput.setUpdatedAt(LocalDateTime.now());
        when(farmInputRepository.save(any(FarmInput.class))).thenReturn(updatedInput);

        FarmInputResponse response = farmInputService.registerOrUpdateInput(farmerId, request);

        assertThat(response.getQuantity()).isEqualTo(75.0);
        assertThat(response.getCumulativeCost()).isEqualTo(6750.0);
        verify(farmInputRepository).save(any(FarmInput.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when quantity is negative")
    void shouldThrowWhenQuantityIsNegative() {
        FarmInputRequest request = new FarmInputRequest(
                "Seeds", InputType.SEEDS, -5.0, "kg", purchaseDate, 1000.0
        );

        assertThatThrownBy(() -> farmInputService.registerOrUpdateInput(farmerId, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("positive number");

        verify(farmInputRepository, never()).save(any(FarmInput.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when quantity is zero")
    void shouldThrowWhenQuantityIsZero() {
        FarmInputRequest request = new FarmInputRequest(
                "Seeds", InputType.SEEDS, 0.0, "kg", purchaseDate, 1000.0
        );

        assertThatThrownBy(() -> farmInputService.registerOrUpdateInput(farmerId, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("positive number");
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when purchase price is negative")
    void shouldThrowWhenPurchasePriceIsNegative() {
        FarmInputRequest request = new FarmInputRequest(
                "Seeds", InputType.SEEDS, 50.0, "kg", purchaseDate, -100.0
        );

        assertThatThrownBy(() -> farmInputService.registerOrUpdateInput(farmerId, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("positive number");
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when name is blank")
    void shouldThrowWhenNameIsBlank() {
        FarmInputRequest request = new FarmInputRequest(
                "  ", InputType.SEEDS, 50.0, "kg", purchaseDate, 1000.0
        );

        assertThatThrownBy(() -> farmInputService.registerOrUpdateInput(farmerId, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("name is required");
    }

    // ------------------------------------------------------------------ //
    //  getInputsByFarmer                                                   //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("Should return all inputs for farmer")
    void shouldReturnAllInputsForFarmer() {
        when(farmInputRepository.findByFarmerId(farmerId)).thenReturn(List.of(seedsInput));

        List<FarmInputResponse> result = farmInputService.getInputsByFarmer(farmerId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Maize Seeds");
    }

    // ------------------------------------------------------------------ //
    //  getInputById                                                        //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("Should return input by ID when found")
    void shouldReturnInputById() {
        when(farmInputRepository.findByIdAndFarmerId(inputId, farmerId))
                .thenReturn(Optional.of(seedsInput));

        FarmInputResponse response = farmInputService.getInputById(farmerId, inputId);

        assertThat(response.getId()).isEqualTo(inputId);
        assertThat(response.getType()).isEqualTo(InputType.SEEDS);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when input not found")
    void shouldThrowWhenInputNotFound() {
        when(farmInputRepository.findByIdAndFarmerId(999L, farmerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> farmInputService.getInputById(farmerId, 999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
