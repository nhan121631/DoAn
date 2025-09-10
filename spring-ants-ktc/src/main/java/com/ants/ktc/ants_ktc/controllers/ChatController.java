package com.ants.ktc.ants_ktc.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ants.ktc.ants_ktc.services.ChatService;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    /**
     * Upload ảnh cho chat và trả về URL
     */
    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadChatImage(@RequestParam("image") MultipartFile image) {
        try {
            // Validate file
            if (image.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "File không được để trống");
                return ResponseEntity.badRequest().body(error);
            }

            // Kiểm tra định dạng file
            String contentType = image.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "File phải là hình ảnh");
                return ResponseEntity.badRequest().body(error);
            }

            // Kiểm tra kích thước file (tối đa 5MB)
            if (image.getSize() > 5 * 1024 * 1024) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Kích thước file không được vượt quá 5MB");
                return ResponseEntity.badRequest().body(error);
            }

            // Upload ảnh
            Map<String, String> uploadResult = chatService.uploadChatImage(image);

            return ResponseEntity.ok(uploadResult);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Upload ảnh thất bại: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
