package com.farmer.tracking.modules.summary;

import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.entity.HarvestUnit;
import java.time.LocalDate;
import java.util.List;

public record ProductionReport(LocalDate from, LocalDate to, List<CycleRow> cycles,
        List<SummaryResponse.Activity> activities, List<HarvestRow> harvests) {
    public record CycleRow(Long id, String name, CycleStatus status, LocalDate plantingDate) {}
    public record HarvestRow(Long id, String cycleName, String crop, Long plotId, String plot,
            LocalDate date, Double quantity, HarvestUnit unit, Double yieldPerHectare) {}
}
