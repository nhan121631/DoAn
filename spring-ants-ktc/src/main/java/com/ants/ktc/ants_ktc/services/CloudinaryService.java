package com.ants.ktc.ants_ktc.services;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("resource_type", "auto")
            );

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
}
