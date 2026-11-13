package com.farmer.tracking.modules.farm.controller;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.farm.model.FarmEquipment;
import com.farmer.tracking.modules.farm.model.FarmEquipment.Status;
import com.farmer.tracking.modules.farm.repository.FarmEquipmentRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/farmers/{farmerId}/equipment")
public class FarmEquipmentController {
    private final FarmEquipmentRepository equipment;

    public FarmEquipmentController(FarmEquipmentRepository equipment) {
        this.equipment = equipment;
    }

    @GetMapping
    public List<FarmEquipment> list(@PathVariable Long farmerId) {
        return equipment.findByFarmerIdOrderByNameAscIdAsc(farmerId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FarmEquipment register(@PathVariable Long farmerId, @Valid @RequestBody Registration request) {
        return equipment.save(new FarmEquipment(farmerId, request.name().strip(),
                request.notes() == null ? null : request.notes().strip(), request.status()));
    }

    @PutMapping("/{equipmentId}/status")
    @Transactional
    public FarmEquipment updateStatus(@PathVariable Long farmerId, @PathVariable Long equipmentId,
            @Valid @RequestBody StatusUpdate update) {
        var item = equipment.findByIdAndFarmerId(equipmentId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", equipmentId));
        item.setStatus(update.status());
        return item;
    }

    public record Registration(@NotBlank @Size(max = 120) String name, @Size(max = 300) String notes,
            @NotNull Status status) {}
    public record StatusUpdate(@NotNull Status status) {}
}
