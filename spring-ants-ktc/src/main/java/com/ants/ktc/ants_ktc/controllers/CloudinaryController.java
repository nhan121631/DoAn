package com.ants.ktc.ants_ktc.controllers;

import com.ants.ktc.ants_ktc.services.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload-image")
@RequiredArgsConstructor
public class CloudinaryController {

    private final CloudinaryService cloudinaryService;

    /**
     * Upload ảnh từ FE (ví dụ thumbnail hoặc ảnh content TinyMCE)
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(cloudinaryService.uploadFile(file));
    }

    /**
     * Upload ảnh riêng cho TinyMCE (FE yêu cầu response JSON có key = "location")
     */
    @PostMapping("/tinymce")
    public ResponseEntity<Map<String, String>> uploadImageForTinyMCE(@RequestParam("file") MultipartFile file) {
        Map<String, String> result = cloudinaryService.uploadFile(file);
        return ResponseEntity.ok(Map.of("location", result.get("url"))); // TinyMCE cần "location"
    }

    /**
     * Xoá ảnh theo publicId
     */
    @DeleteMapping("/{publicId}")
    public ResponseEntity<Void> deleteFile(@PathVariable String publicId) {
        cloudinaryService.deleteFile(publicId);
        return ResponseEntity.noContent().build();
    }
}
