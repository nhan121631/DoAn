package com.ants.ktc.ants_ktc.services;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.ants.ktc.ants_ktc.config.EnvLoader;

@Service
public class ApprovalLogService {

    private static final String APPROVAL_LOG_CSV = "approval_log.csv";

    private final RestTemplate restTemplate;

    public ApprovalLogService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Gửi CSV file lên Slack và xóa nội dung file
     */
    public Map<String, Object> sendCsvToSlackAndClear(String channelId, String message) {
        Map<String, Object> result = new HashMap<>();

        try {
            System.out.println("[ApprovalLogService] 📤 Sending CSV to Slack...");

            // Gửi CSV lên Slack
            Map<String, Object> uploadResult = sendCsvToSlack(channelId, message);

            if (uploadResult != null && Boolean.TRUE.equals(uploadResult.get("success"))) {
                // Chỉ clear file khi upload thành công
                int clearedRecords = clearCsvFile();

                result.put("success", true);
                result.put("message", "CSV sent to Slack and cleared successfully");
                result.put("records", uploadResult.get("records"));
                result.put("clearedRecords", clearedRecords);
                result.put("slackResponse", uploadResult.get("slackResponse"));

                System.out.println("[ApprovalLogService] ✅ CSV sent and cleared successfully");

            } else {
                result.put("success", false);
                result.put("message", "Failed to send CSV to Slack: " +
                        (uploadResult != null ? uploadResult.get("message") : "Unknown error"));
            }

        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Error in send and clear operation: " + e.getMessage());
            System.err.println("[ApprovalLogService] ❌ Error: " + e.getMessage());
            e.printStackTrace();
        }

        return result;
    }

    /**
     * Gửi CSV file lên Slack
     */
    public Map<String, Object> sendCsvToSlack(String channelId, String message) {
        Map<String, Object> result = new HashMap<>();

        try {
            System.out.println("[ApprovalLogService] 🚀 Starting CSV upload to Slack using v2 flow...");
            System.out.println("[ApprovalLogService] Channel ID: " + channelId);
            System.out.println("[ApprovalLogService] Message: " + message);

            // Kiểm tra Slack token
            String slackToken = EnvLoader.get("SLACK_BOT_TOKEN");
            if (slackToken == null || slackToken.trim().isEmpty()) {
                result.put("success", false);
                result.put("message", "Slack token not configured. Please set SLACK_BOT_TOKEN environment variable.");
                return result;
            }

            // Kiểm tra file tồn tại
            File csvFile = new File(APPROVAL_LOG_CSV);
            System.out.println("[ApprovalLogService] Checking file: " + csvFile.getAbsolutePath());

            if (!csvFile.exists()) {
                System.err.println("[ApprovalLogService] ❌ CSV file not found: " + csvFile.getAbsolutePath());
                result.put("success", false);
                result.put("message", "CSV file not found: " + csvFile.getAbsolutePath());
                return result;
            }

            System.out.println("[ApprovalLogService] ✅ CSV file exists, size: " + csvFile.length() + " bytes");

            // Đọc số dòng trong file
            long lineCount = Files.lines(Paths.get(APPROVAL_LOG_CSV)).count();
            System.out.println("[ApprovalLogService] CSV file has " + lineCount + " lines");

            if (lineCount <= 1) { // Chỉ có header
                System.out.println("[ApprovalLogService] ⚠️ CSV file is empty (only header)");
                result.put("success", false);
                result.put("message", "CSV file is empty (only header)");
                return result;
            }

            // Bước 1: Lấy upload URL và file ID
            System.out.println("[ApprovalLogService] 📋 Step 1: Getting upload URL...");
            Map<String, String> uploadInfo = getUploadUrlAndFileId(csvFile);
            if (uploadInfo == null || uploadInfo.get("upload_url") == null || uploadInfo.get("file_id") == null) {
                result.put("success", false);
                result.put("message", "Failed to get upload URL and file ID from Slack");
                return result;
            }

            String uploadUrl = uploadInfo.get("upload_url");
            String fileId = uploadInfo.get("file_id");
            System.out.println("[ApprovalLogService] Got file_id: " + fileId);

            // Bước 2: Upload file lên URL
            System.out.println("[ApprovalLogService] 📤 Step 2: Uploading file to URL...");
            boolean uploadSuccess = uploadFileToUrl(uploadUrl, csvFile);
            if (!uploadSuccess) {
                result.put("success", false);
                result.put("message", "Failed to upload file to Slack");
                return result;
            }

            // Bước 3: Complete upload và share
            System.out.println("[ApprovalLogService] ✅ Step 3: Completing upload and sharing...");
            boolean shared = completeUploadAndShare(fileId, channelId, message, csvFile.getName());

            if (shared) {
                result.put("success", true);
                result.put("message", "CSV file sent to Slack successfully using v2");
                result.put("channel", channelId);
                result.put("records", lineCount - 1);
                result.put("fileId", fileId);

                System.out.println("[ApprovalLogService] 🎉 CSV sent to Slack channel: " + channelId + " (v2)");
            } else {
                result.put("success", false);
                result.put("message", "Failed to complete upload and share file");
            }

        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Error sending CSV to Slack: " + e.getMessage());
            System.err.println("[ApprovalLogService] ❌ Error sending CSV to Slack: " + e.getMessage());
            e.printStackTrace();
        }

        return result;
    }

    /**
     * Xóa nội dung CSV file, giữ lại header
     */
    public int clearCsvFile() {
        try {
            Path csvPath = Paths.get(APPROVAL_LOG_CSV);
            if (!Files.exists(csvPath)) {
                return 0;
            }

            long originalLineCount = Files.lines(csvPath).count();
            int recordsCleared = (int) Math.max(0, originalLineCount - 1); // Trừ header

            // Ghi lại file chỉ với header
            Files.write(csvPath, "Timestamp,Room Title,Status,Reason\n".getBytes());

            System.out.println("[ApprovalLogService] 🗑️ Cleared " + recordsCleared + " records from CSV file");
            return recordsCleared;

        } catch (Exception e) {
            System.err.println("[ApprovalLogService] ❌ Error clearing CSV file: " + e.getMessage());
            return 0;
        }
    }

    // Private helper methods cho Slack upload

    /**
     * Bước 1: Lấy upload URL và file ID từ Slack
     */
    private Map<String, String> getUploadUrlAndFileId(File file) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(EnvLoader.get("SLACK_BOT_TOKEN"));
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            String filename = "approval_log_" +
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";

            MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
            requestBody.add("filename", filename);
            requestBody.add("length", String.valueOf(file.length()));

            System.out.println(
                    "[ApprovalLogService] Request body (form): filename=" + filename + ", length=" + file.length());

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    "https://slack.com/api/files.getUploadURLExternal",
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            System.out.println("[ApprovalLogService] getUploadUrl response status: " + response.getStatusCode());
            System.out.println("[ApprovalLogService] getUploadUrl response: " + response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                if (responseBody != null && Boolean.TRUE.equals(responseBody.get("ok"))) {
                    String uploadUrl = (String) responseBody.get("upload_url");
                    String fileId = (String) responseBody.get("file_id");

                    if (uploadUrl != null && fileId != null) {
                        Map<String, String> result = new HashMap<>();
                        result.put("upload_url", uploadUrl);
                        result.put("file_id", fileId);
                        System.out.println("[ApprovalLogService] ✅ Got upload_url and file_id: " + fileId);
                        return result;
                    }
                } else {
                    System.err.println("[ApprovalLogService] Slack API error: "
                            + (responseBody != null ? responseBody.get("error") : "Unknown error"));
                    System.err.println("[ApprovalLogService] Full response: " + responseBody);
                }
            } else {
                System.err.println("[ApprovalLogService] HTTP error: " + response.getStatusCode());
            }
            return null;

        } catch (Exception e) {
            System.err.println("[ApprovalLogService] Error getting upload URL: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Bước 2: Upload file lên URL
     */
    private boolean uploadFileToUrl(String uploadUrl, File file) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);

            byte[] fileContent = Files.readAllBytes(file.toPath());
            HttpEntity<byte[]> entity = new HttpEntity<>(fileContent, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    uploadUrl,
                    HttpMethod.POST,
                    entity,
                    String.class);

            System.out.println("[ApprovalLogService] uploadFileToUrl response: " + response.getStatusCode());

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("[ApprovalLogService] ✅ File uploaded successfully");
                return true;
            }
            return false;

        } catch (Exception e) {
            System.err.println("[ApprovalLogService] Error uploading file to URL: " + e.getMessage());
            return false;
        }
    }

    /**
     * Bước 3: Complete upload và share file tới channel
     */
    private boolean completeUploadAndShare(String fileId, String channelId, String message, String filename) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(EnvLoader.get("SLACK_BOT_TOKEN"));
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> fileInfo = new HashMap<>();
            fileInfo.put("id", fileId);
            fileInfo.put("title", "Room Approval Log - " +
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("files", java.util.Arrays.asList(fileInfo));
            requestBody.put("channel_id", channelId);
            requestBody.put("initial_comment", message + " - " +
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    "https://slack.com/api/files.completeUploadExternal",
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            System.out.println("[ApprovalLogService] completeUpload response: " + response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                boolean success = responseBody != null && Boolean.TRUE.equals(responseBody.get("ok"));
                if (success) {
                    System.out.println("[ApprovalLogService] ✅ File shared to Slack successfully!");
                } else {
                    System.err.println("[ApprovalLogService] Slack API error: "
                            + (responseBody != null ? responseBody.get("error") : "Unknown error"));
                }
                return success;
            }
            return false;

        } catch (Exception e) {
            System.err.println("[ApprovalLogService] Error completing upload: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
