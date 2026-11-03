package com.farmer.tracking.modules.crop.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.crop.api.CycleIncidentRequest;
import com.farmer.tracking.modules.crop.api.CycleIncidentResponse;
import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleIncident;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.repository.CycleIncidentRepository;
import com.farmer.tracking.modules.crop.repository.CycleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Business logic for cycle incidents (diseases, pests, damage).
 * <p>
 * Every public method first verifies that the cycle belongs to the specified
 * farmer — this enforces data-isolation (security) at the service layer.
 * </p>
 */
@Service
public class CycleIncidentService {

    private final CycleIncidentRepository incidentRepository;
    private final CycleRepository          cycleRepository;

    public CycleIncidentService(CycleIncidentRepository incidentRepository,
                                CycleRepository cycleRepository) {
        this.incidentRepository = incidentRepository;
        this.cycleRepository    = cycleRepository;
    }

    // ------------------------------------------------------------------ //
    //  Queries                                                             //
    // ------------------------------------------------------------------ //

    /**
     * Returns all incidents for a cycle, most recent first.
     * Fulfils AC: "when the cycle is viewed, the list of associated incidents is visible".
     */
    @Transactional(readOnly = true)
    public List<CycleIncidentResponse> getIncidentsByCycle(Long farmerId, Long cycleId) {
        Cycle cycle = getCycleForFarmer(farmerId, cycleId);
        return incidentRepository.findByCycleIdOrderByIncidentDateDesc(cycle.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns a single incident by its ID.
     */
    @Transactional(readOnly = true)
    public CycleIncidentResponse getIncident(Long farmerId, Long cycleId, Long incidentId) {
        Cycle cycle = getCycleForFarmer(farmerId, cycleId);
        CycleIncident incident = incidentRepository.findByIdAndCycleId(incidentId, cycle.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Incident", incidentId));
        return toResponse(incident);
    }

    // ------------------------------------------------------------------ //
    //  Commands                                                            //
    // ------------------------------------------------------------------ //

    /**
     * Records a new incident on an active cycle.
     * Fulfils AC: "when an incident is added with its type, date, and description,
     * then it appears in the cycle's history".
     */
    @Transactional
    public CycleIncidentResponse createIncident(Long farmerId, Long cycleId,
                                                CycleIncidentRequest request) {
        Cycle cycle = getCycleForFarmer(farmerId, cycleId);

        if (cycle.getStatus() != null && cycle.getStatus() != CycleStatus.ACTIVE) {
            throw new IllegalStateException(
                    "Incidents can only be recorded for an ACTIVE cycle. Current status: "
                            + cycle.getStatus());
        }

        CycleIncident incident = new CycleIncident(
                farmerId,
                cycle,
                request.getIncidentType(),
                request.getIncidentDate(),
                request.getDescription(),
                request.getSeverityLevel(),
                request.getActionTaken()
        );

        CycleIncident saved = incidentRepository.save(incident);
        return toResponse(saved);
    }

    /**
     * Updates an existing incident.
     */
    @Transactional
    public CycleIncidentResponse updateIncident(Long farmerId, Long cycleId,
                                                Long incidentId,
                                                CycleIncidentRequest request) {
        Cycle cycle = getCycleForFarmer(farmerId, cycleId);
        CycleIncident incident = incidentRepository.findByIdAndCycleId(incidentId, cycle.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Incident", incidentId));

        incident.setIncidentType(request.getIncidentType());
        incident.setIncidentDate(request.getIncidentDate());
        incident.setDescription(request.getDescription());
        incident.setSeverityLevel(request.getSeverityLevel());
        incident.setActionTaken(request.getActionTaken());

        CycleIncident updated = incidentRepository.save(incident);
        return toResponse(updated);
    }

    /**
     * Deletes an incident from a cycle.
     */
    @Transactional
    public void deleteIncident(Long farmerId, Long cycleId, Long incidentId) {
        Cycle cycle = getCycleForFarmer(farmerId, cycleId);
        CycleIncident incident = incidentRepository.findByIdAndCycleId(incidentId, cycle.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Incident", incidentId));
        incidentRepository.delete(incident);
    }

    // ------------------------------------------------------------------ //
    //  Private helpers                                                     //
    // ------------------------------------------------------------------ //

    /**
     * Ensures the cycle exists AND belongs to the farmer.
     * This is the primary security gate — prevents any cross-farmer data access.
     */
    private Cycle getCycleForFarmer(Long farmerId, Long cycleId) {
        return cycleRepository.findByIdAndFarmerId(cycleId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cycle not found with id: " + cycleId + " for farmer: " + farmerId));
    }

    /** Maps a {@link CycleIncident} entity to its public response DTO. */
    private CycleIncidentResponse toResponse(CycleIncident incident) {
        return new CycleIncidentResponse(
                incident.getId(),
                incident.getCycle().getId(),
                incident.getFarmerId(),
                incident.getIncidentType(),
                incident.getIncidentDate(),
                incident.getDescription(),
                incident.getSeverityLevel(),
                incident.getActionTaken(),
                incident.getCreatedAt(),
                incident.getUpdatedAt()
        );
    }
}
