package com.farmer.tracking.common.util;

import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.modules.crop.entity.Cycle;
import java.time.LocalDate;

public final class ProductionRules {
    private ProductionRules() {}

    public static void positiveFinite(Double value, String name) {
        if (value == null || !Double.isFinite(value) || value <= 0) {
            throw new BadRequestException(name + " must be a finite, positive number.");
        }
    }

    public static void eventDate(Cycle cycle, LocalDate date) {
        if (date == null || date.isAfter(LocalDate.now())) {
            throw new BadRequestException("Record date is required and cannot be in the future.");
        }
        if (cycle.getStartDate() != null && date.isBefore(cycle.getStartDate())) {
            throw new BadRequestException("Record date cannot be before the cycle planting date.");
        }
    }
}
