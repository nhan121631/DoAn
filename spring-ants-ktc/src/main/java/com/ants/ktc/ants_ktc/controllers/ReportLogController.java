package com.ants.ktc.ants_ktc.controllers;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.ants.ktc.ants_ktc.config.EnvLoader;

@RestController
@RequestMapping("/api/reports")
public class ReportLogController {

    private static final String SLACK_TOKEN = EnvLoader.get("SLACK_BOT_TOKEN");
    private static final String SLACK_CHANNEL_ID = "C09GVNUF5LG";

    private final RestTemplate restTemplate = new RestTemplate();

    // DTO class for report data
    public static class ReportData {
        private String reason;
        private String description;
        private String contactName;
        private String contactPhone;
        private String postUrl;

        // Getters and Setters
        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getContactName() {
            return contactName;
        }

        public void setContactName(String contactName) {
            this.contactName = contactName;
        }

        public String getContactPhone() {
            return contactPhone;
        }

        public void setContactPhone(String contactPhone) {
            this.contactPhone = contactPhone;
        }

        public String getPostUrl() {
            return postUrl;
        }

        public void setPostUrl(String postUrl) {
            this.postUrl = postUrl;
        }
    }

    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitReport(@RequestBody ReportData reportData) {
        Map<String, Object> response = new HashMap<>();

        System.out.println("[ReportLogController] 🚨 Received new report submission");
        System.out.println("[ReportLogController] Reason: " + reportData.getReason());
        System.out.println(
                "[ReportLogController] Contact: " + reportData.getContactName() + " - " + reportData.getContactPhone());
        System.out.println("[ReportLogController] Post URL: " + reportData.getPostUrl());

        try {
            // Validate required fields
            if (reportData.getReason() == null || reportData.getReason().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Reason is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (reportData.getContactName() == null || reportData.getContactName().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Contact name is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (reportData.getContactPhone() == null || reportData.getContactPhone().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Contact phone is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (SLACK_TOKEN == null || SLACK_TOKEN.trim().isEmpty()) {
                System.err.println("[ReportLogController] ❌ SLACK_BOT_TOKEN not configured");
                response.put("success", false);
                response.put("message", "Slack integration not configured");
                return ResponseEntity.internalServerError().body(response);
            }

            // Send to Slack
            boolean sent = sendReportToSlack(reportData);

            if (sent) {
                response.put("success", true);
                response.put("message", "Report submitted successfully");
                response.put("channelId", SLACK_CHANNEL_ID);
                response.put("timestamp",
                        LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

                System.out.println("[ReportLogController] ✅ Report sent to Slack channel: " + SLACK_CHANNEL_ID);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Failed to send report to Slack");
                return ResponseEntity.internalServerError().body(response);
            }

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error processing report: " + e.getMessage());
            System.err.println("[ReportLogController] ❌ Error processing report: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(response);
        }
    }

    private boolean sendReportToSlack(ReportData reportData) {
        try {
            // Format timestamp
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));

            // Create Slack message
            Map<String, Object> slackMessage = new HashMap<>();
            slackMessage.put("channel", SLACK_CHANNEL_ID);

            String messageText = "🚨 *New Room Report*\n\n";
            messageText += "*Timestamp:* " + timestamp + "\n";
            messageText += "*Reporter:* " + reportData.getContactName() + "\n";
            messageText += "*Phone:* " + reportData.getContactPhone() + "\n";
            messageText += "*Post URL:* " + (reportData.getPostUrl() != null ? reportData.getPostUrl() : "N/A") + "\n";
            messageText += "*Reason:* " + reportData.getReason() + "\n";

            if (reportData.getDescription() != null && !reportData.getDescription().trim().isEmpty()) {
                messageText += "*Additional Details:* " + reportData.getDescription() + "\n";
            }

            messageText += "\n_Report ID: " + System.currentTimeMillis() + "_";

            slackMessage.put("text", messageText);

            // Send to Slack
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(SLACK_TOKEN);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(slackMessage, headers);

            System.out.println("[ReportLogController] 📤 Sending report to Slack channel: " + SLACK_CHANNEL_ID);

            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.exchange(
                    "https://slack.com/api/chat.postMessage",
                    HttpMethod.POST,
                    entity,
                    Map.class);

            System.out.println("[ReportLogController] Slack response: " + response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
                if (responseBody != null) {
                    boolean success = Boolean.TRUE.equals(responseBody.get("ok"));

                    if (!success) {
                        System.err.println("[ReportLogController] Slack API error: " + responseBody.get("error"));
                    }

                    return success;
                }
            }

            return false;

        } catch (Exception e) {
            System.err.println("[ReportLogController] Error sending report to Slack: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
