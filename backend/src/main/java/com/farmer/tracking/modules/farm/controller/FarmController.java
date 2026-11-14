package com.farmer.tracking.modules.farm.controller;

import com.farmer.tracking.common.exception.ApiException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.farm.dto.CreateFarmRequest;
import com.farmer.tracking.modules.farm.dto.FarmResponse;
import com.farmer.tracking.modules.farm.dto.UpdateFarmRequest;
import com.farmer.tracking.modules.farm.service.FarmService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for managing farmer farms and holdings.
 */
@RestController
@RequestMapping({"/api/v1/farms", "/api/farms"})
@Tag(name = "Farm Management", description = "Endpoints for creating, listing, viewing, and updating farmer farm structures")
public class FarmController {

    private final FarmService farmService;
    private final FarmerRepository farmerRepository;

    @Value("${app.uploads.dir:./uploads/avatars}")
    private String uploadsDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public FarmController(FarmService farmService, FarmerRepository farmerRepository) {
        this.farmService = farmService;
        this.farmerRepository = farmerRepository;
    }

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a farm photo from device (JPEG, PNG, WebP — max 10 MB)")
    public ResponseEntity<Map<String, String>> uploadFarmImage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {
        if (userDetails == null) {
            throw new ApiException("Authentication required.", HttpStatus.UNAUTHORIZED);
        }
        if (file == null || file.isEmpty()) {
            throw new ApiException("Please select an image file to upload.", HttpStatus.BAD_REQUEST);
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new ApiException("Only image files (JPEG, PNG, WebP, etc.) are allowed.", HttpStatus.BAD_REQUEST);
        }
        try {
            Path avatarsPath = Paths.get(uploadsDir).toAbsolutePath().normalize();
            Path farmsUploadPath = avatarsPath.getParent() != null
                    ? avatarsPath.getParent().resolve("farms")
                    : Paths.get("./uploads/farms").toAbsolutePath().normalize();
            Files.createDirectories(farmsUploadPath);

            String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "farm.jpg";
            String extension = original.contains(".")
                    ? original.substring(original.lastIndexOf('.'))
                    : ".jpg";
            if (!extension.matches("\\.(jpg|jpeg|png|webp|gif)")) {
                extension = ".jpg";
            }
            String filename = "farm-" + UUID.randomUUID() + extension;
            Path destination = farmsUploadPath.resolve(filename);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            String imageUrl = baseUrl + "/uploads/farms/" + filename;
            return ResponseEntity.ok(Map.of("url", imageUrl));
        } catch (IOException e) {
            throw new ApiException("Failed to save uploaded farm image.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping
    @Operation(summary = "Create a new farm record for the authenticated farmer")
    public ResponseEntity<FarmResponse> createFarm(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateFarmRequest request) {
        Long farmerId = extractFarmerId(userDetails);
        FarmResponse response = farmService.createFarm(farmerId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Fetch all farms belonging to the authenticated farmer")
    public ResponseEntity<List<FarmResponse>> getFarms(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long farmerId = extractFarmerId(userDetails);
        List<FarmResponse> farms = farmService.getFarmsByFarmer(farmerId);
        return ResponseEntity.ok(farms);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Fetch details for a specific farm (verifies owner data isolation)")
    public ResponseEntity<FarmResponse> getFarmById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Long farmerId = extractFarmerId(userDetails);
        FarmResponse farm = farmService.getFarmById(id, farmerId);
        return ResponseEntity.ok(farm);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update farm details (verifies owner data isolation)")
    public ResponseEntity<FarmResponse> updateFarm(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody UpdateFarmRequest request) {
        Long farmerId = extractFarmerId(userDetails);
        FarmResponse updatedFarm = farmService.updateFarm(id, farmerId, request);
        return ResponseEntity.ok(updatedFarm);
    }

    private Long extractFarmerId(UserDetails userDetails) {
        if (userDetails instanceof UserPrincipal principal) {
            return principal.getId();
        }
        Farmer farmer = farmerRepository.findByEmailOrPhone(userDetails.getUsername().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated farmer not found with username: " + userDetails.getUsername()));
        return farmer.getId();
    }
}