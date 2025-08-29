package com.ants.ktc.ants_ktc.services;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ChatService {

    @Autowired
    private CloudinaryService cloudinaryService;

    /**
     * Upload ảnh chat lên Google Cloud (thông qua Cloudinary)
     * @param image File ảnh
     * @return Map chứa URL và thông tin ảnh
     */
    public Map<String, String> uploadChatImage(MultipartFile image) {
        try {
            // Upload lên Cloudinary (có thể thay thế bằng Google Cloud Storage sau)
            Map<String, String> uploadResult = cloudinaryService.uploadFile(image);
            
            // Tạo response data
            Map<String, String> result = new HashMap<>();
            result.put("imageUrl", uploadResult.get("url"));
            result.put("publicId", uploadResult.get("publicId"));
            result.put("fileName", image.getOriginalFilename());
            result.put("fileSize", String.valueOf(image.getSize()));
            
            return result;
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload chat image: " + e.getMessage(), e);
        }
    }

    /**
     * Xóa ảnh chat khỏi storage
     * @param publicId Public ID của ảnh trên Cloudinary
     */
    public void deleteChatImage(String publicId) {
        try {
            cloudinaryService.deleteFile(publicId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete chat image: " + e.getMessage(), e);
        }
    }
}
