package com.farmer.tracking.modules.crop.service;

import com.farmer.tracking.modules.crop.api.CycleResponse;
import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.Harvest;
import com.farmer.tracking.modules.crop.entity.HarvestUnit;

import java.util.Map;
import java.util.Set;

public final class QuantityGapCalculator {

    private static final Map<HarvestUnit, Double> TO_KG = Map.of(
            HarvestUnit.KG, 1.0,
            HarvestUnit.TONS, 1000.0
    );

    private QuantityGapCalculator() {
    }

    public static void apply(CycleResponse response, Cycle cycle, Harvest harvest) {
        if (response == null || cycle == null || harvest == null
                || cycle.getExpectedQuantity() == null || harvest.getQuantity() == null
                || harvest.getUnit() == null) {
            return;
        }

        Double comparableQuantity = convertToUnit(harvest.getQuantity(), harvest.getUnit(), cycle.getExpectedQuantityUnit());
        if (comparableQuantity == null) {
            return;
        }

        double expected = cycle.getExpectedQuantity();
        double gap = comparableQuantity - expected;

        response.setHarvestedQuantity(round(harvest.getQuantity(), 2));
        response.setHarvestedUnit(harvest.getUnit().name());
        response.setGapQuantity(round(gap, 2));
        if (expected > 0) {
            response.setGapPercentage(round((gap / expected) * 100.0, 1));
        }
    }

    private static Double convertToUnit(Double quantity, HarvestUnit harvestUnit, String expectedUnit) {
        if (expectedUnit == null || expectedUnit.isBlank()) {
            return null;
        }
        String unit = expectedUnit.trim().toLowerCase();
        if (Set.of("kg", "kilogram", "kilograms").contains(unit)) {
            Double factor = TO_KG.get(harvestUnit);
            return factor == null ? null : quantity * factor;
        }
        if (Set.of("t", "ton", "tons", "tonne", "tonnes").contains(unit)) {
            if (harvestUnit == HarvestUnit.TONS) {
                return quantity;
            }
            if (harvestUnit == HarvestUnit.KG) {
                return quantity / 1000.0;
            }
            return null;
        }
        if (Set.of("bag", "bags").contains(unit)) {
            return harvestUnit == HarvestUnit.BAGS ? quantity : null;
        }
        return null;
    }

    private static double round(double value, int places) {
        double scale = Math.pow(10, places);
        return Math.round(value * scale) / scale;
    }
}
