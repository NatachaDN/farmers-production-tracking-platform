package com.farmer.tracking.modules.input.api;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

/** A farmer-confirmed price for one unit, used only when the old cost basis is unknown. */
public record UnitCostRequest(@NotNull @DecimalMin("0.0") Double unitCost) {}
