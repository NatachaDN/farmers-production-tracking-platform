package com.farmer.tracking.modules.input.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class FarmInputTest {

    private FarmInput newInput(double quantity, double totalPrice) {
        return new FarmInput(1L, "NPK", InputType.FERTILIZER, quantity, "kg",
                LocalDate.now(), totalPrice, totalPrice);
    }

    @Test
    @DisplayName("Unit cost of a first purchase is total price / quantity")
    void unitCost_FirstPurchase() {
        FarmInput input = newInput(50.0, 25000.0);

        assertThat(input.getUnitCost()).isEqualTo(500.0);
    }

    @Test
    @DisplayName("Restocking updates stock, cumulative cost and weighted-average unit cost")
    void addStock_ComputesWeightedAverage() {
        FarmInput input = newInput(50.0, 25000.0);   // 500 / kg

        input.addStock(50.0, 35000.0);                // 700 / kg

        assertThat(input.getQuantity()).isEqualTo(100.0);
        assertThat(input.getCumulativeCost()).isEqualTo(60000.0);
        assertThat(input.getPurchasePrice()).isEqualTo(35000.0);
        assertThat(input.getUnitCost()).isCloseTo(600.0, within(0.0001));
    }

    @Test
    @DisplayName("Restocking after partial consumption values only the remaining stock")
    void addStock_AfterConsumption() {
        FarmInput input = newInput(50.0, 25000.0);   // 500 / kg
        input.setQuantity(10.0);                       // 40 kg consumed

        input.addStock(10.0, 7000.0);                  // 700 / kg

        assertThat(input.getQuantity()).isEqualTo(20.0);
        assertThat(input.getUnitCost()).isCloseTo(600.0, within(0.0001));
    }

    @Test
    @DisplayName("Legacy rows without a stored unit cost fall back to cumulative cost / quantity")
    void unitCost_LegacyFallback() {
        FarmInput input = new FarmInput();
        input.setQuantity(200.0);
        input.setCumulativeCost(12000.0);

        assertThat(input.getUnitCost()).isEqualTo(60.0);
    }
}
