package com.farmer.tracking.modules.farm.controller;

import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.farm.dto.CreateFarmRequest;
import com.farmer.tracking.modules.farm.dto.FarmResponse;
import com.farmer.tracking.modules.farm.model.FarmMap;
import com.farmer.tracking.modules.farm.repository.FarmMapRepository;
import com.farmer.tracking.modules.farm.repository.FarmRepository;
import com.farmer.tracking.modules.farm.service.FarmService;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.HexFormat;

@RestController
@RequestMapping("/api/v1/farms")
public class FarmMapController {
    private static final int MAX_BYTES = 5 * 1024 * 1024;
    private static final byte[] PNG = HexFormat.of().parseHex("89504e470d0a1a0a");
    private static final byte[] JPEG = HexFormat.of().parseHex("ffd8ff");
    private final FarmService farms;
    private final FarmMapRepository maps;
    private final FarmRepository farmRecords;

    public FarmMapController(FarmService farms, FarmMapRepository maps, FarmRepository farmRecords) {
        this.farms = farms;
        this.maps = maps;
        this.farmRecords = farmRecords;
    }

    @PostMapping(value = "/with-map", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<FarmResponse> create(@AuthenticationPrincipal UserPrincipal user,
                                               @Valid @RequestPart("farm") CreateFarmRequest request,
                                               @RequestPart("map") MultipartFile map) throws IOException {
        if (map.isEmpty() || map.getSize() > MAX_BYTES) {
            throw new BadRequestException("Choose a PNG or JPEG image up to 5 MB.");
        }
        byte[] content = map.getBytes();
        String mediaType = imageType(content);
        request.setMapImageUrl(null);
        FarmResponse saved = farms.createFarm(user.getId(), request);
        maps.save(new FarmMap(saved.getId(), mediaType, content));
        String url = "/farms/" + saved.getId() + "/map";
        farmRecords.findById(saved.getId()).orElseThrow().setMapImageUrl(url);
        saved.setMapImageUrl(url);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}/map")
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> image(@AuthenticationPrincipal UserPrincipal user, @PathVariable Long id) {
        farms.getFarmById(id, user.getId());
        FarmMap map = maps.findById(id).orElseThrow(() -> new ResourceNotFoundException("No map saved for this farm."));
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .contentType(MediaType.parseMediaType(map.getMediaType()))
                .header("X-Content-Type-Options", "nosniff").body(map.getImage());
    }

    private String imageType(byte[] image) {
        if (Arrays.equals(PNG, Arrays.copyOf(image, PNG.length))) return MediaType.IMAGE_PNG_VALUE;
        if (Arrays.equals(JPEG, Arrays.copyOf(image, JPEG.length))) return MediaType.IMAGE_JPEG_VALUE;
        throw new BadRequestException("The farm map must be a PNG or JPEG image.");
    }
}
