package com.ants.ktc.ants_ktc.worker;

import java.io.File;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.ants.ktc.ants_ktc.entities.Image;
import com.ants.ktc.ants_ktc.models.ImageUploadMessage;
import com.ants.ktc.ants_ktc.repositories.ImageJpaRepository;
import com.ants.ktc.ants_ktc.services.CloudinaryService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ImageUploadWorker {
    private final RedisTemplate<String, ImageUploadMessage> redisTemplate;
    private final CloudinaryService cloudinaryService;
    private final ImageJpaRepository imageJpaRepository;

    private static final String IMAGE_UPLOAD_QUEUE = "image_upload_queue";
    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final long BASE_DELAY_MS = 1000;

    @Scheduled(fixedDelay = 500) // mỗi 0.5s xử lý 1 batch
    public void processQueue() {
        ImageUploadMessage job;
        while ((job = redisTemplate.opsForList().leftPop(IMAGE_UPLOAD_QUEUE, 2, TimeUnit.SECONDS)) != null) {
            try {
                File file = new File(job.getLocalTempPath());

                // Kiểm tra file có tồn tại không
                if (!file.exists()) {
                    System.err.println("Temp file not found: " + job.getLocalTempPath());
                    continue;
                }

                Map<String, String> uploadResult = cloudinaryService.uploadFile(file);

                // Update DB
                Image image = imageJpaRepository.findById(job.getImageId()).orElseThrow();
                image.setUrl(uploadResult.get("url")); // cập nhật URL từ Cloudinary
                imageJpaRepository.save(image);

                // Xóa file tạm sau khi upload thành công
                boolean deleted = file.delete();
                if (!deleted) {
                    System.err.println("Failed to delete temp file: " + job.getLocalTempPath());
                }

                System.out.println("Successfully uploaded image ID: " + job.getImageId() + " to Cloudinary");

            } catch (Exception e) {
                handleUploadFailure(job, e);
            }
        }
    }

    private void handleUploadFailure(ImageUploadMessage job, Exception e) {
        job.setRetryCount(job.getRetryCount() + 1);

        if (job.getRetryCount() <= MAX_RETRY_ATTEMPTS) {
            // Exponential backoff - delay before retry
            long delayMs = BASE_DELAY_MS * (long) Math.pow(2, job.getRetryCount() - 1);

            System.err.println("Upload failed for image ID: " + job.getImageId() +
                    " (attempt " + job.getRetryCount() + "/" + MAX_RETRY_ATTEMPTS +
                    "). Will retry in " + delayMs + "ms. Error: " + e.getMessage());

            // Schedule retry với delay
            scheduleRetry(job, delayMs);
        } else {
            // Đã vượt quá số lần retry, xử lý thất bại cuối cùng
            System.err.println("Max retry attempts reached for image ID: " + job.getImageId() +
                    ". Upload failed permanently. Error: " + e.getMessage());

            // Cleanup temp file
            File tempFile = new File(job.getLocalTempPath());
            if (tempFile.exists()) {
                tempFile.delete();
            }

            // Xóa image record thay vì giữ với error URL
            try {
                Image image = imageJpaRepository.findById(job.getImageId()).orElse(null);
                if (image != null) {
                    imageJpaRepository.delete(image); // Xóa luôn record bị lỗi
                    System.out.println("Deleted failed image record ID: " + job.getImageId());
                }
            } catch (Exception dbError) {
                System.err.println("Failed to delete failed image record: " + dbError.getMessage());
            }
        }
    }

    private void scheduleRetry(ImageUploadMessage job, long delayMs) {
        // Sử dụng thread để delay và retry
        new Thread(() -> {
            try {
                Thread.sleep(delayMs);
                redisTemplate.opsForList().rightPush(IMAGE_UPLOAD_QUEUE, job);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                System.err.println("Retry scheduling interrupted for image ID: " + job.getImageId());
            }
        }).start();
    }
}
