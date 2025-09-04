package com.ants.ktc.ants_ktc.controllers;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.ants.ktc.ants_ktc.config.EnvLoader;

@RestController
@RequestMapping("/api/approval-log")
public class ApprovalLogController {

    private static final String APPROVAL_LOG_CSV = "approval_log.csv";
    private static final String SLACK_TOKEN = EnvLoader.get("SLACK_BOT_TOKEN");

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/send-to-slack")
    public ResponseEntity<Map<String, Object>> sendCsvToSlack(
            @RequestParam(value = "channel", defaultValue = "C09CM2NAF1P") String channelId,
            @RequestParam(value = "message", defaultValue = "Room Approval Log Report") String message) {

        Map<String, Object> response = new HashMap<>();

        System.out.println("[ApprovalLogController] 🚀 Starting CSV upload to Slack using v2 flow...");
        System.out.println("[ApprovalLogController] Channel ID: " + channelId);
        System.out.println("[ApprovalLogController] Message: " + message);

        try {
            // Kiểm tra file tồn tại
            File csvFile = new File(APPROVAL_LOG_CSV);
            System.out.println("[ApprovalLogController] Checking file: " + csvFile.getAbsolutePath());

            if (!csvFile.exists()) {
                System.err.println("[ApprovalLogController] ❌ CSV file not found: " + csvFile.getAbsolutePath());
                response.put("success", false);
                response.put("message", "CSV file not found: " + csvFile.getAbsolutePath());
                return ResponseEntity.badRequest().body(response);
            }

            System.out.println("[ApprovalLogController] ✅ CSV file exists, size: " + csvFile.length() + " bytes");

            // Đọc số dòng trong file
            long lineCount = Files.lines(Paths.get(APPROVAL_LOG_CSV)).count();
            System.out.println("[ApprovalLogController] CSV file has " + lineCount + " lines");

            if (lineCount <= 1) { // Chỉ có header
                System.out.println("[ApprovalLogController] ⚠️ CSV file is empty (only header)");
                response.put("success", false);
                response.put("message", "CSV file is empty (only header)");
                return ResponseEntity.badRequest().body(response);
            }

            // Bước 1: Lấy upload URL và file ID
            System.out.println("[ApprovalLogController] 📋 Step 1: Getting upload URL...");
            Map<String, String> uploadInfo = getUploadUrlAndFileId(csvFile);
            if (uploadInfo == null || uploadInfo.get("upload_url") == null) {
                response.put("success", false);
                response.put("message", "Failed to get upload URL from Slack");
                return ResponseEntity.internalServerError().body(response);
            }

            String uploadUrl = uploadInfo.get("upload_url");
            String fileId = uploadInfo.get("file_id");

            System.out.println("[ApprovalLogController] 📋 Got upload_url and file_id: " + fileId);

            // Bước 2: Upload file lên URL
            System.out.println("[ApprovalLogController] 📤 Step 2: Uploading file to URL...");
            boolean uploaded = uploadFileToUrl(uploadUrl, csvFile);
            if (!uploaded) {
                response.put("success", false);
                response.put("message", "Failed to upload file to Slack");
                return ResponseEntity.internalServerError().body(response);
            }

            // Bước 3: Complete upload và share
            System.out.println("[ApprovalLogController] ✅ Step 3: Completing upload and sharing...");
            boolean shared = completeUploadAndShare(fileId, channelId, message, csvFile.getName());

            if (shared) {
                response.put("success", true);
                response.put("message", "CSV file sent to Slack successfully using v2");
                response.put("channel", channelId);
                response.put("records", lineCount - 1);
                response.put("fileId", fileId);

                System.out.println("[ApprovalLogController] 🎉 CSV sent to Slack channel: " + channelId + " (v2)");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Failed to complete upload and share file");
                return ResponseEntity.internalServerError().body(response);
            }

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error sending CSV to Slack: " + e.getMessage());
            System.err.println("[ApprovalLogController] ❌ Error sending CSV to Slack: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(response);
        }
    }
    private Map<String, String> getUploadUrlAndFileId(File file) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(SLACK_TOKEN);
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            String filename = "approval_log_" +
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";

            MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
            requestBody.add("filename", filename);
            requestBody.add("length", String.valueOf(file.length()));

            System.out.println(
                    "[ApprovalLogController] Request body (form): filename=" + filename + ", length=" + file.length());

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    "https://slack.com/api/files.getUploadURLExternal",
                    HttpMethod.POST,
                    entity,
                    Map.class);

            System.out.println("[ApprovalLogController] getUploadUrl response status: " + response.getStatusCode());
            System.out.println("[ApprovalLogController] getUploadUrl response: " + response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                if (responseBody != null && Boolean.TRUE.equals(responseBody.get("ok"))) {
                    Map<String, String> result = new HashMap<>();
                    result.put("upload_url", (String) responseBody.get("upload_url"));
                    result.put("file_id", (String) responseBody.get("file_id"));
                    return result;
                } else {
                    System.err.println("[ApprovalLogController] Slack API error: "
                            + (responseBody != null ? responseBody.get("error") : "null response"));
                    System.err.println("[ApprovalLogController] Full response: " + responseBody);
                }
            } else {
                System.err.println("[ApprovalLogController] HTTP error: " + response.getStatusCode());
            }
            return null;

        } catch (Exception e) {
            System.err.println("[ApprovalLogController] Error getting upload URL: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Bước 2: Upload file lên URL được cung cấp
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

            System.out.println("[ApprovalLogController] uploadFileToUrl response: " + response.getStatusCode());

            if (response.getStatusCode().is2xxSuccessful()) {
                return true;
            }
            return false;

        } catch (Exception e) {
            System.err.println("[ApprovalLogController] Error uploading file to URL: " + e.getMessage());
            return false;
        }
    }

    /**
     * Bước 3: Hoàn thành upload và chia sẻ file lên channel
     */
    private boolean completeUploadAndShare(String fileId, String channelId, String message, String filename) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(SLACK_TOKEN);
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

            ResponseEntity<Map> response = restTemplate.exchange(
                    "https://slack.com/api/files.completeUploadExternal",
                    HttpMethod.POST,
                    entity,
                    Map.class);

            System.out.println("[ApprovalLogController] completeUpload response: " + response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                return Boolean.TRUE.equals(responseBody.get("ok"));
            }
            return false;

        } catch (Exception e) {
            System.err.println("[ApprovalLogController] Error completing upload: " + e.getMessage());
            return false;
        }
    }

    /**
     * API để xóa file CSV sau khi gửi
     */
    @DeleteMapping("/clear-csv")
    public ResponseEntity<Map<String, Object>> clearCsvFile() {
        Map<String, Object> response = new HashMap<>();

        try {
            Path csvPath = Paths.get(APPROVAL_LOG_CSV);

            if (Files.exists(csvPath)) {
                // Đếm số dòng trước khi xóa
                long lineCount = Files.lines(csvPath).count();

                Files.delete(csvPath);

                // Tạo lại file với header
                Files.write(csvPath, "Timestamp,Room Title,Status,Reason\n".getBytes());

                response.put("success", true);
                response.put("message", "CSV file cleared successfully");
                response.put("deletedRecords", Math.max(0, lineCount - 1));

                System.out.println(
                        "[ApprovalLogController] 🗑️ CSV file cleared, deleted " + (lineCount - 1) + " records");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "CSV file not found");
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error clearing CSV file: " + e.getMessage());
            System.err.println("[ApprovalLogController] ❌ Error clearing CSV: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * API để gửi CSV và xóa file trong một lần gọi
     */
    @PostMapping("/send-and-clear")
    public ResponseEntity<Map<String, Object>> sendCsvAndClear(
            @RequestParam(value = "channel", defaultValue = "C09CM2NAF1P") String channelId,
            @RequestParam(value = "message", defaultValue = "Room Approval Log Report") String message) {

        // Gửi file trước
        ResponseEntity<Map<String, Object>> sendResult = sendCsvToSlack(channelId, message);

        if (sendResult.getStatusCode().is2xxSuccessful() &&
                ((Map<String, Object>) sendResult.getBody()).get("success").equals(true)) {

            // Nếu gửi thành công, xóa file
            ResponseEntity<Map<String, Object>> clearResult = clearCsvFile();

            Map<String, Object> response = new HashMap<>();
            response.put("sendResult", sendResult.getBody());
            response.put("clearResult", clearResult.getBody());
            response.put("success", true);
            response.put("message", "CSV sent to Slack and file cleared successfully");

            return ResponseEntity.ok(response);
        } else {
            // Nếu gửi thất bại, không xóa file
            return sendResult;
        }
    }

    /**
     * API để kiểm tra trạng thái file CSV
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getCsvStatus() {
        Map<String, Object> response = new HashMap<>();

        try {
            Path csvPath = Paths.get(APPROVAL_LOG_CSV);

            if (Files.exists(csvPath)) {
                long lineCount = Files.lines(csvPath).count();
                long fileSize = Files.size(csvPath);

                response.put("exists", true);
                response.put("totalLines", lineCount);
                response.put("recordCount", Math.max(0, lineCount - 1)); // Trừ header
                response.put("fileSizeBytes", fileSize);
                response.put("lastModified", Files.getLastModifiedTime(csvPath).toString());
            } else {
                response.put("exists", false);
                response.put("recordCount", 0);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
