package com.ants.ktc.ants_ktc.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private final String cloudName;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
        this.cloudName = cloudinary.config.cloudName; // lấy cloud_name từ config
    }

    public Map<String, String> uploadFile(MultipartFile file) {
        try {
            Map<String, Object> options = new HashMap<>();
            options.put("chunk_size", 6000000);

            String contentType = file.getContentType();
            if (contentType != null && contentType.equalsIgnoreCase("application/pdf")) {
                // PDF cần set raw + upload để không bị Blocked for delivery
                options.put("resource_type", "raw");
                options.put("type", "upload");
            } else {
                // Ảnh, video... để auto như cũ
                options.put("resource_type", "auto");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), options);

            if (uploadResult == null) {
                throw new RuntimeException("Cloudinary upload returned null result");
            }

            // secure_url or url may be present depending on resource_type/response
            Object secureUrlObj = uploadResult.get("secure_url");
            Object urlObj = uploadResult.get("url");
            String secureUrl = secureUrlObj != null ? secureUrlObj.toString()
                    : (urlObj != null ? urlObj.toString() : null);

            String relativePath = null;
            if (secureUrl != null && cloudName != null && secureUrl.contains("/" + cloudName)) {
                relativePath = secureUrl.substring(secureUrl.indexOf("/" + cloudName));
            } else if (secureUrl != null) {
                // fallback to full secure url
                relativePath = secureUrl;
            }

            Map<String, String> result = new HashMap<>();
            result.put("url", relativePath != null ? relativePath : ""); // path rút gọn (có thể dùng full secure_url
                                                                         // nếu bạn muốn)

            Object publicIdObj = uploadResult.get("public_id");
            if (publicIdObj != null) {
                result.put("publicId", publicIdObj.toString());
            }

            Object formatObj = uploadResult.get("format");
            if (formatObj != null) {
                result.put("format", formatObj.toString()); // ví dụ: jpg, png, pdf
            }

            return result;
        } catch (IOException e) {
            throw new RuntimeException("Upload to Cloudinary failed: " + e.getMessage(), e);
        }
    }

    /**
     * Upload từ File object (sử dụng cho background worker)
     */
    public Map<String, String> uploadFile(File file) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    file,
                    ObjectUtils.asMap(
                            "resource_type", "auto",
                            "chunk_size", 6000000,
                            "use_filename", true,
                            "unique_filename", true));

            String secureUrl = uploadResult.get("secure_url").toString();
            // Cắt từ "/<cloud_name>" trở đi
            String relativePath = secureUrl.substring(secureUrl.indexOf("/" + cloudName));

            Map<String, String> result = new HashMap<>();
            result.put("url", relativePath); // path rút gọn
            result.put("publicId", uploadResult.get("public_id").toString());
            return result;
        } catch (IOException e) {
            throw new RuntimeException("Upload to Cloudinary failed: " + e.getMessage(), e);
        }
    }

    /**
     * Delete file from Cloudinary using public_id
     */
    public void deleteFile(String publicId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> deleteResult = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            String result = deleteResult.get("result").toString();
            if (!"ok".equals(result) && !"not found".equals(result)) {
                System.err.println("Failed to delete file from Cloudinary: " + result + " for public_id: " + publicId);
            } else {
                System.out.println("Successfully deleted file from Cloudinary: " + publicId + " - Result: " + result);
            }
        } catch (Exception e) {
            throw new RuntimeException("Delete from Cloudinary failed: " + e.getMessage(), e);
        }
    }
}
