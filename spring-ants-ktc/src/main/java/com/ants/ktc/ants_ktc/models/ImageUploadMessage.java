package com.ants.ktc.ants_ktc.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImageUploadMessage {
    private UUID roomId;
    private Long imageId;
    private String localTempPath; // đường dẫn tạm file ảnh (hoặc byte[] base64)
    private int retryCount = 0;
}