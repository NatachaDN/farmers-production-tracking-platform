package com.farmer.tracking.modules.farm.controller;

import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.farm.model.FarmTask;
import com.farmer.tracking.modules.farm.repository.FarmTaskRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/farmers/{farmerId}/tasks")
public class FarmTaskController {
    private final FarmTaskRepository tasks;

    public FarmTaskController(FarmTaskRepository tasks) { this.tasks = tasks; }

    @GetMapping
    public List<FarmTask> list(@PathVariable Long farmerId, @RequestParam String month) {
        YearMonth period;
        try {
            period = YearMonth.parse(month);
        } catch (java.time.format.DateTimeParseException error) {
            throw new BadRequestException("Use a year and month in YYYY-MM format.");
        }
        return tasks.findByFarmerIdAndDateBetweenOrderByDateAscIdAsc(farmerId, period.atDay(1), period.atEndOfMonth());
    }

    @GetMapping("/reminders")
    public Reminders reminders(@PathVariable Long farmerId) {
        LocalDate today = LocalDate.now();
        return new Reminders(today, tasks.findTop10ByFarmerIdAndCompletedFalseAndDateLessThanEqualOrderByDateAscIdAsc(farmerId, today.plusDays(1)));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FarmTask schedule(@PathVariable Long farmerId, @Valid @RequestBody TaskRequest request) {
        return tasks.save(new FarmTask(farmerId, request.title().strip(), request.date()));
    }

    @PutMapping("/{taskId}/complete")
    @Transactional
    public FarmTask complete(@PathVariable Long farmerId, @PathVariable Long taskId) {
        FarmTask task = tasks.findByIdAndFarmerId(taskId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm task", taskId));
        task.complete();
        return task;
    }

    public record TaskRequest(@NotBlank @Size(max = 140) String title, @NotNull LocalDate date) {}
    public record Reminders(LocalDate today, List<FarmTask> tasks) {}
}
