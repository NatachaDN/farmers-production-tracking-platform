package com.farmer.tracking.modules.summary;

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
}
