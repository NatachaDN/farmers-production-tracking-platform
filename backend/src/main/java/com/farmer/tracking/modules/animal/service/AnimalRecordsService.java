package com.farmer.tracking.modules.animal.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.animal.dto.*;
import com.farmer.tracking.modules.animal.model.*;
import com.farmer.tracking.modules.animal.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AnimalRecordsService {

    private final AnimalGroupRepository animalGroupRepository;
    private final AnimalProductionRepository productionRepository;
    private final AnimalActivityRepository activityRepository;
    private final AnimalIncidentRepository incidentRepository;

    public AnimalRecordsService(
            AnimalGroupRepository animalGroupRepository,
            AnimalProductionRepository productionRepository,
            AnimalActivityRepository activityRepository,
            AnimalIncidentRepository incidentRepository
    ) {
        this.animalGroupRepository = animalGroupRepository;
        this.productionRepository = productionRepository;
        this.activityRepository = activityRepository;
        this.incidentRepository = incidentRepository;
    }

    private AnimalGroup getOwnedGroup(Long groupId, Long farmerId) {
        return animalGroupRepository.findByIdAndFarmerId(groupId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal group", groupId));
    }

    // ---- Productions ----

    @Transactional(readOnly = true)
    public List<AnimalProductionResponse> getProductions(Long groupId, Long farmerId) {
        getOwnedGroup(groupId, farmerId);
        return productionRepository.findByAnimalGroupIdAndFarmerIdOrderByProductionDateDesc(groupId, farmerId)
                .stream().map(AnimalProductionResponse::fromEntity).collect(Collectors.toList());
    }

    public AnimalProductionResponse createProduction(Long groupId, Long farmerId, AnimalProductionRequest req) {
        AnimalGroup group = getOwnedGroup(groupId, farmerId);
        AnimalProduction p = new AnimalProduction();
        p.setFarmerId(farmerId);
        p.setAnimalGroup(group);
        p.setProductionType(req.getProductionType().trim().toUpperCase());
        p.setQuantity(req.getQuantity());
        p.setUnit(req.getUnit().trim());
        p.setProductionDate(req.getProductionDate());
        p.setQualityGrade(req.getQualityGrade() != null ? req.getQualityGrade().trim() : null);
        p.setEstimatedRevenue(req.getEstimatedRevenue());
        p.setNotes(req.getNotes() != null ? req.getNotes().trim() : null);
        return AnimalProductionResponse.fromEntity(productionRepository.save(p));
    }

    public void deleteProduction(Long groupId, Long farmerId, Long recordId) {
        AnimalProduction p = productionRepository.findByIdAndAnimalGroupIdAndFarmerId(recordId, groupId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal production", recordId));
        productionRepository.delete(p);
    }

    // ---- Activities ----

    @Transactional(readOnly = true)
    public List<AnimalActivityResponse> getActivities(Long groupId, Long farmerId) {
        getOwnedGroup(groupId, farmerId);
        return activityRepository.findByAnimalGroupIdAndFarmerIdOrderByActivityDateDesc(groupId, farmerId)
                .stream().map(AnimalActivityResponse::fromEntity).collect(Collectors.toList());
    }

    public AnimalActivityResponse createActivity(Long groupId, Long farmerId, AnimalActivityRequest req) {
        AnimalGroup group = getOwnedGroup(groupId, farmerId);
        AnimalActivity a = new AnimalActivity();
        a.setFarmerId(farmerId);
        a.setAnimalGroup(group);
        a.setActivityType(req.getActivityType().trim().toUpperCase());
        a.setActivityDate(req.getActivityDate());
        a.setPerformedBy(req.getPerformedBy() != null ? req.getPerformedBy().trim() : null);
        a.setCost(req.getCost());
        a.setNotes(req.getNotes() != null ? req.getNotes().trim() : null);
        return AnimalActivityResponse.fromEntity(activityRepository.save(a));
    }

    public AnimalActivityResponse updateActivity(Long groupId, Long farmerId, Long activityId, AnimalActivityRequest req) {
        AnimalActivity a = activityRepository.findByIdAndAnimalGroupIdAndFarmerId(activityId, groupId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal activity", activityId));
        a.setActivityType(req.getActivityType().trim().toUpperCase());
        a.setActivityDate(req.getActivityDate());
        a.setPerformedBy(req.getPerformedBy() != null ? req.getPerformedBy().trim() : null);
        a.setCost(req.getCost());
        a.setNotes(req.getNotes() != null ? req.getNotes().trim() : null);
        return AnimalActivityResponse.fromEntity(activityRepository.save(a));
    }

    public void deleteActivity(Long groupId, Long farmerId, Long activityId) {
        AnimalActivity a = activityRepository.findByIdAndAnimalGroupIdAndFarmerId(activityId, groupId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal activity", activityId));
        activityRepository.delete(a);
    }

    // ---- Incidents ----

    @Transactional(readOnly = true)
    public List<AnimalIncidentResponse> getIncidents(Long groupId, Long farmerId) {
        getOwnedGroup(groupId, farmerId);
        return incidentRepository.findByAnimalGroupIdAndFarmerIdOrderByIncidentDateDesc(groupId, farmerId)
                .stream().map(AnimalIncidentResponse::fromEntity).collect(Collectors.toList());
    }

    public AnimalIncidentResponse createIncident(Long groupId, Long farmerId, AnimalIncidentRequest req) {
        AnimalGroup group = getOwnedGroup(groupId, farmerId);
        AnimalIncident i = new AnimalIncident();
        i.setFarmerId(farmerId);
        i.setAnimalGroup(group);
        i.setIncidentType(req.getIncidentType().trim().toUpperCase());
        i.setIncidentDate(req.getIncidentDate());
        i.setAffectedCount(req.getAffectedCount());
        i.setSeverityLevel(req.getSeverityLevel());
        i.setDescription(req.getDescription().trim());
        i.setActionTaken(req.getActionTaken() != null ? req.getActionTaken().trim() : null);
        return AnimalIncidentResponse.fromEntity(incidentRepository.save(i));
    }

    public AnimalIncidentResponse updateIncident(Long groupId, Long farmerId, Long incidentId, AnimalIncidentRequest req) {
        AnimalIncident i = incidentRepository.findByIdAndAnimalGroupIdAndFarmerId(incidentId, groupId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal incident", incidentId));
        i.setIncidentType(req.getIncidentType().trim().toUpperCase());
        i.setIncidentDate(req.getIncidentDate());
        i.setAffectedCount(req.getAffectedCount());
        i.setSeverityLevel(req.getSeverityLevel());
        i.setDescription(req.getDescription().trim());
        i.setActionTaken(req.getActionTaken() != null ? req.getActionTaken().trim() : null);
        return AnimalIncidentResponse.fromEntity(incidentRepository.save(i));
    }

    public void deleteIncident(Long groupId, Long farmerId, Long incidentId) {
        AnimalIncident i = incidentRepository.findByIdAndAnimalGroupIdAndFarmerId(incidentId, groupId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal incident", incidentId));
        incidentRepository.delete(i);
    }
}

