package com.farmer.tracking.modules.crop.controller;

import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.crop.entity.ReferenceCrop;
import com.farmer.tracking.modules.crop.repository.ReferenceCropRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;
import java.util.Locale;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
public class ReferenceCropController {
    private final ReferenceCropRepository crops;

    public ReferenceCropController(ReferenceCropRepository crops) { this.crops = crops; }

    @GetMapping("/api/v1/reference-crops")
    public List<ReferenceCrop> enabled() { return crops.findByEnabledTrueOrderByNameAsc(); }

    @GetMapping("/api/v1/admin/reference-crops")
    public List<ReferenceCrop> list() { return crops.findAllByOrderByNameAsc(); }

    @PostMapping("/api/v1/admin/reference-crops")
    @ResponseStatus(HttpStatus.CREATED)
    public ReferenceCrop create(@Valid @RequestBody Entry entry) { return save(new ReferenceCrop(), entry); }

    @PutMapping("/api/v1/admin/reference-crops/{id}")
    public ReferenceCrop update(@PathVariable Long id, @Valid @RequestBody Entry entry) {
        return save(crops.findById(id).orElseThrow(() -> new ResourceNotFoundException("Reference crop", id)), entry);
    }

    private ReferenceCrop save(ReferenceCrop crop, Entry entry) {
        String name = entry.name().strip();
        crop.update(name, name.toLowerCase(Locale.ROOT), entry.enabled());
        try {
            return crops.saveAndFlush(crop);
        } catch (DataIntegrityViolationException duplicate) {
            throw new ConflictException("A reference crop with that name already exists.");
        }
    }

    public record Entry(@NotBlank @Size(max = 120) String name, @NotNull Boolean enabled) {}
}
