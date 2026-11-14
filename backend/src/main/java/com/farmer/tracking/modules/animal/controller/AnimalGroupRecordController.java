package com.farmer.tracking.modules.animal.controller;

import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.animal.model.AnimalGroup;
import com.farmer.tracking.modules.animal.model.AnimalGroupRecord;
import com.farmer.tracking.modules.animal.model.AnimalGroupRecord.Kind;
import com.farmer.tracking.modules.animal.repository.AnimalGroupRecordRepository;
import com.farmer.tracking.modules.animal.repository.AnimalGroupRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/animals")
public class AnimalGroupRecordController {
    private final AnimalGroupRepository groups;
    private final AnimalGroupRecordRepository records;

    public AnimalGroupRecordController(AnimalGroupRepository groups, AnimalGroupRecordRepository records) {
        this.groups = groups;
        this.records = records;
    }

    @GetMapping("/recent-production")
    @Transactional(readOnly = true)
    public List<RecentProduction> recentProduction(@AuthenticationPrincipal UserPrincipal farmer, @RequestParam(required = false) Long farmId) {
        var recent = farmId == null
                ? records.findTop5ByGroup_Farmer_IdAndKindOrderByDateDescIdDesc(farmer.getId(), Kind.PRODUCTION)
                : records.findTop5ByGroup_Farmer_IdAndGroup_Farm_IdAndKindOrderByDateDescIdDesc(farmer.getId(), farmId, Kind.PRODUCTION);
        return recent
                .stream().map(record -> new RecentProduction(record.getGroupName(), Row.from(record))).toList();
    }

    @GetMapping("/groups/{groupId}/records")
    @Transactional(readOnly = true)
    public List<Row> list(@AuthenticationPrincipal UserPrincipal farmer, @PathVariable Long groupId) {
        ownedGroup(farmer, groupId);
        return records.findByGroup_IdOrderByDateDescIdDesc(groupId).stream().map(Row::from).toList();
    }

    @GetMapping("/production-report")
    @Transactional(readOnly = true)
    public List<ProductionRow> productionReport(@AuthenticationPrincipal UserPrincipal farmer,
                                                 @RequestParam LocalDate from, @RequestParam LocalDate to) {
        if (from.isAfter(to)) throw new BadRequestException("The end date must be on or after the start date.");
        return records.productionReport(farmer.getId(), null, from, to).stream().map(ProductionRow::from).toList();
    }

    @PostMapping("/groups/{groupId}/records")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Row record(@AuthenticationPrincipal UserPrincipal farmer, @PathVariable Long groupId,
            @Valid @RequestBody Entry entry) {
        AnimalGroup group = groups.findForUpdate(groupId)
                .filter(row -> Objects.equals(row.getFarmer().getId(), farmer.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Animal group", groupId));
        if (group.getStartDate() != null && entry.date().isBefore(group.getStartDate())) {
            throw new BadRequestException("The record date cannot be before the group start date.");
        }
        String unit = entry.unit().strip();
        if (entry.kind() != Kind.FEEDING && entry.kind() != Kind.PRODUCTION) {
            adjustPopulation(group, entry);
            unit = "animals";
        }
        var record = records.save(new AnimalGroupRecord(group, entry.kind(), entry.name().strip(),
                entry.quantity(), unit, entry.date()));
        return Row.from(record, group.getCurrentPopulation());
    }

    private void adjustPopulation(AnimalGroup group, Entry entry) {
        int count;
        try {
            count = entry.quantity().intValueExact();
        } catch (ArithmeticException invalid) {
            throw new BadRequestException("Enter a whole number of animals that fits in the group.");
        }
        long updated = switch (entry.kind()) {
            case DEATH, SALE, REMOVAL -> (long) group.getCurrentPopulation() - count;
            default -> (long) group.getCurrentPopulation() + count;
        };
        if (updated < 0) throw new BadRequestException("The change exceeds the current group population.");
        if (updated > Integer.MAX_VALUE) throw new BadRequestException("The resulting group population is too large.");
        group.setCurrentPopulation((int) updated);
    }

    private AnimalGroup ownedGroup(UserPrincipal farmer, Long groupId) {
        return groups.findByIdAndFarmerId(groupId, farmer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Animal group", groupId));
    }

    public record Entry(@NotNull Kind kind, @NotBlank @Size(max = 80) String name,
            @NotNull @Positive @Digits(integer = 13, fraction = 3) BigDecimal quantity,
            @NotBlank @Size(max = 24) String unit, @NotNull @PastOrPresent LocalDate date) {}

    public record RecentProduction(String groupName, Row record) {}

    public record ProductionRow(String farm, String group, Row record) {
        public static ProductionRow from(AnimalGroupRecord entry) {
            return new ProductionRow(entry.getFarmName(), entry.getGroupName(), Row.from(entry));
        }
    }

    public record Row(Long id, Kind kind, String name, BigDecimal quantity, String unit, LocalDate date, Integer currentPopulation) {
        static Row from(AnimalGroupRecord record) {
            return from(record, null);
        }

        static Row from(AnimalGroupRecord record, Integer currentPopulation) {
            return new Row(record.getId(), record.getKind(), record.getName(), record.getQuantity(),
                    record.getUnit(), record.getDate(), currentPopulation);
        }
    }
}
