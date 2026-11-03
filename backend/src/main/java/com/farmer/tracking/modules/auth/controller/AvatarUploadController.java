package com.farmer.tracking.modules.auth.controller;

import com.farmer.tracking.common.exception.ApiException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

/**
 * Handles avatar photo uploads for authenticated farmers.
 * Uploaded files are saved to the configured directory and served via /uploads/avatars/*.
 */
@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Auth", description = "Authentication, profile management, and avatar upload")
public class AvatarUploadController {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024L; // 5 MB
    private static final java.util.Set<String> ALLOWED_TYPES = java.util.Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    @Value("${app.uploads.dir:./uploads/avatars}")
    private String uploadsDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @PostMapping(value = "/upload-avatar", consumes = "multipart/form-data")
    @Operation(summary = "Upload a profile photo from the user's device (JPEG, PNG, WebP — max 5 MB)")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {

        if (userDetails == null) {
            throw new ApiException("Authentication required.", HttpStatus.UNAUTHORIZED);
        }

        // Validate content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new ApiException("Only JPEG, PNG, WebP and GIF images are allowed.", HttpStatus.BAD_REQUEST);
        }

        // Validate size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ApiException("Image must be smaller than 5 MB.", HttpStatus.BAD_REQUEST);
        }

        try {
            // Ensure upload directory exists
            Path uploadPath = Paths.get(uploadsDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            // Build a unique filename preserving the original extension
            String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "photo";
            String extension = original.contains(".")
                    ? original.substring(original.lastIndexOf('.'))
                    : ".jpg";
            // Sanitise extension
            if (!extension.matches("\\.(jpg|jpeg|png|webp|gif)")) {
                extension = ".jpg";
            }

            String filename = UUID.randomUUID() + extension;
            Path destination = uploadPath.resolve(filename);

            // Save file to disk
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            // Return the public URL
            String avatarUrl = baseUrl + "/uploads/avatars/" + filename;
            return ResponseEntity.ok(Map.of("url", avatarUrl));

        } catch (IOException e) {
            throw new ApiException("Failed to save uploaded file. Please try again.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
