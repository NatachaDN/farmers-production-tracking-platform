package com.farmer.tracking.modules.summary;

import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

/** FarmerOwnershipFilter enforces the same ownership policy as all farmer-scoped modules. */
@RestController
@RequestMapping("/api/v1/farmers/{farmerId}/summary")
public class SummaryController {
    private final SummaryService service;
    public SummaryController(SummaryService service) { this.service = service; }
    @GetMapping
    public SummaryResponse get(@PathVariable Long farmerId, @RequestParam(required = false) Long farmId) {
        return service.get(farmerId, farmId);
    }

    @GetMapping("/production-report")
    public ProductionReport getProductionReport(@PathVariable Long farmerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.productionReport(farmerId, from, to);
    }
}
