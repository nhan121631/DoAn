package com.ants.ktc.ants_ktc.worker;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.ants.ktc.ants_ktc.dtos.approval.ApprovalRequestDto;
import com.ants.ktc.ants_ktc.dtos.approval.ApprovalResult;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.models.ApprovalMessage;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
import com.ants.ktc.ants_ktc.repositories.projection.MailUserProjection;
import com.ants.ktc.ants_ktc.services.ApprovalQueueService;
import com.ants.ktc.ants_ktc.services.ApprovalLogService;
import com.ants.ktc.ants_ktc.services.MailService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class ApprovalWorker {

    @Autowired
    @Qualifier("approvalQueue")
    private BlockingQueue<ApprovalMessage> approvalQueue;

    @Autowired
    private MailService mailService;

    @Autowired
    private RoomJpaRepository roomJpaRepository;

    @Autowired
    private ApprovalQueueService approvalQueueService;

    // Thêm ApprovalLogService
    @Autowired
    private ApprovalLogService approvalLogService;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final long RETRY_DELAY_MS = 10000; // 10 seconds
    private static final String GEMINI_API_URL = "http://localhost:5000/ai_approval";
    private static final String APPROVAL_LOG_CSV = "approval_log.csv";

    public ApprovalWorker() {
        this.restTemplate = new RestTemplateBuilder()
                .build();
        this.objectMapper = new ObjectMapper();
        initializeCsvFile();
    }

    // @Scheduled(fixedDelay = 600000) // Disabled - chỉ chạy theo schedule 12h trưa
    // và tối
    public void processApprovalQueue() {
        try {
            // Lấy 1 job từ queue (non-blocking)
            ApprovalMessage job = approvalQueue.poll(1, TimeUnit.SECONDS);
            if (job == null) {
                return; // Không có job nào
            }

            System.out.println("[ApprovalWorker] Processing approval for room: " + job.getRoomId());

            // Gọi Gemini API để duyệt phòng
            try {
                ApprovalResult result = callGeminiApprovalAPI(job);

                if (result != null) {
                    // Cập nhật trạng thái phòng trong database
                    updateRoomApprovalStatus(job.getRoomId(), result);
                    System.out.println("[ApprovalWorker] ✅ Room " + job.getRoomId() +
                            " approved with status: " + result.getStatus());
                } else {
                    // Retry logic
                    handleApprovalFailure(job, new Exception("Null result from Gemini API"));
                }

            } catch (Exception e) {
                handleApprovalFailure(job, e);
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            System.err.println("[ApprovalWorker] Worker interrupted");
        } catch (Exception e) {
            System.err.println("[ApprovalWorker] Unexpected error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private ApprovalResult callGeminiApprovalAPI(ApprovalMessage job) throws Exception {
        // Tạo request body theo format API /ai_approval
        ApprovalRequestDto request = new ApprovalRequestDto();
        request.setId(job.getRoomId().toString());
        request.setTitle(job.getTitle());
        request.setDescription(job.getDescription());
        request.setPriceMonth(job.getPriceMonth());
        request.setPriceDeposit(job.getPriceDeposit());
        request.setArea(job.getArea());
        request.setLength(job.getLength());
        request.setWidth(job.getWidth());
        request.setMaxPeople(job.getMaxPeople());
        request.setElecPrice(job.getElecPrice());
        request.setWaterPrice(job.getWaterPrice());
        request.setFullAddress(job.getFullAddress());
        request.setConvenients(job.getConvenients());
        request.setImages(job.getImages());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<ApprovalRequestDto> entity = new HttpEntity<>(request, headers);

        System.out.println("[ApprovalWorker] Calling Gemini API for room: " + job.getRoomId());

        ResponseEntity<String> response = restTemplate.exchange(
                GEMINI_API_URL,
                HttpMethod.POST,
                entity,
                String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            // Parse JSON response
            JsonNode jsonResponse = objectMapper.readTree(response.getBody());

            ApprovalResult result = new ApprovalResult();
            result.setStatus(jsonResponse.get("status").asInt());

            // Parse content array
            JsonNode contentNode = jsonResponse.get("content");
            if (contentNode != null && contentNode.isArray()) {
                StringBuilder contentBuilder = new StringBuilder();
                for (JsonNode item : contentNode) {
                    if (contentBuilder.length() > 0) {
                        contentBuilder.append("; ");
                    }
                    contentBuilder.append(item.asText());
                }
                result.setContent(contentBuilder.toString());
            }

            return result;
        } else {
            throw new Exception("API call failed with status: " + response.getStatusCode());
        }
    }

    @Transactional
    private void updateRoomApprovalStatus(java.util.UUID roomId, ApprovalResult result) {
        try {
            Room room = roomJpaRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Room not found: " + roomId));

            if (result.getStatus() == 1) {
                room.setApproval(1);
                try {
                    MailUserProjection mailuser = roomJpaRepository.findMailUsersByRoomId(roomId).stream()
                            .findFirst()
                            .orElse(null);

                    if (mailuser != null && mailuser.getEmail() != null && !mailuser.getEmail().trim().isEmpty()) {
                        System.out.println("[ApprovalWorker] ℹ️ Room approved for user: " + mailuser.getEmail());
                    }
                } catch (Exception e) {
                    System.err.println("[ApprovalWorker] ⚠️ Failed to log approval info: " + e.getMessage());
                }

                // Ghi vào CSV log
                logToCSV(room.getTitle(), "APPROVED", "Đạt tiêu chuẩn duyệt");

                System.out.println("[ApprovalWorker] ✅ Room " + roomId + " APPROVED");
            } else if (result.getStatus() == 2) {
                room.setApproval(2);

                // Gửi email thông báo từ chối với validation
                try {
                    MailUserProjection mailuser = roomJpaRepository.findMailUsersByRoomId(roomId).stream()
                            .findFirst()
                            .orElse(null);

                    if (mailuser != null && mailuser.getEmail() != null && !mailuser.getEmail().trim().isEmpty()) {
                        // Sử dụng method mới để gửi email từ chối
                        mailService.sendRoomRejectionNotification(
                                mailuser.getEmail(),
                                mailuser.getFullName() != null ? mailuser.getFullName() : "Chủ nhà",
                                room.getTitle() != null ? room.getTitle() : "Phòng trọ",
                                result.getContent() != null ? result.getContent() : "Không đạt tiêu chuẩn duyệt");
                        System.out.println("[ApprovalWorker] Rejection email sent to: " + mailuser.getEmail());
                    } else {
                        System.err.println(
                                "[ApprovalWorker] Cannot send rejection email - invalid email for room: " + roomId);
                    }
                } catch (Exception emailError) {
                    System.err.println("[ApprovalWorker] ❌ Failed to send rejection email for room " + roomId + ": "
                            + emailError.getMessage());
                }

                // Ghi vào CSV log
                logToCSV(room.getTitle(), "REJECTED", result.getContent());

                System.out.println("[ApprovalWorker] ❌ Room " + roomId + " REJECTED: " + result.getContent());
            } else if (result.getStatus() == 0) {
                System.out.println("[ApprovalWorker] Room " + roomId + " rate limited, will retry");
                return;
            }

            roomJpaRepository.save(room);

        } catch (Exception e) {
            System.err.println("[ApprovalWorker] Failed to update room " + roomId + ": " + e.getMessage());
            throw e;
        }
    }

    private void handleApprovalFailure(ApprovalMessage job, Exception e) {
        System.err.println("[ApprovalWorker] Failed to process room " + job.getRoomId() + ": " + e.getMessage());

        job.setRetryCount(job.getRetryCount() + 1);

        if (job.getRetryCount() < MAX_RETRY_ATTEMPTS) {
            // Retry với delay
            scheduleRetry(job, RETRY_DELAY_MS * job.getRetryCount());
            System.out.println("[ApprovalWorker] Scheduled retry " + job.getRetryCount() +
                    "/" + MAX_RETRY_ATTEMPTS + " for room " + job.getRoomId());
        } else {
            System.err.println("[ApprovalWorker] Max retries reached for room " + job.getRoomId());

            try {
                Room room = roomJpaRepository.findById(job.getRoomId()).orElse(null);
                if (room != null) {
                }
            } catch (Exception dbException) {
                System.err.println("[ApprovalWorker] Failed to mark room as error: " + dbException.getMessage());
            }
        }
    }

    private void scheduleRetry(ApprovalMessage job, long delayMs) {
        new Thread(() -> {
            try {
                Thread.sleep(delayMs);
                approvalQueue.offer(job);
                System.out.println("[ApprovalWorker] Re-queued room " + job.getRoomId() + " for retry");
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                System.err.println("[ApprovalWorker] Retry scheduling interrupted for room: " + job.getRoomId());
            }
        }).start();
    }

    /**
     * Schedule để tự động thêm pending rooms vào approval queue
     * Chạy mỗi 10 phút để check phòng mới chờ duyệt
     */
    @Scheduled(fixedRate = 600000) // 10 phút = 600,000 ms
    public void scheduleEnqueuePendingRooms() {
        try {
            System.out.println("[ApprovalWorker] Running scheduled enqueue pending rooms...");
            int enqueuedCount = approvalQueueService.enqueuePendingRooms();

            if (enqueuedCount > 0) {
                System.out.println("[ApprovalWorker] Scheduled enqueue: " + enqueuedCount + " rooms added to queue");
            } else {
                System.out.println("[ApprovalWorker] Scheduled enqueue: No new pending rooms found");
            }

        } catch (Exception e) {
            System.err.println("[ApprovalWorker] Error in scheduled enqueue: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Schedule để report queue status mỗi 30 phút
     */
    @Scheduled(fixedRate = 1800000) // 30 phút = 1,800,000 ms
    public void scheduleQueueStatusReport() {
        try {
            var queueStatus = approvalQueueService.getQueueStatus();
            System.out.println("[ApprovalWorker] Queue Status: " + queueStatus.toString());

            // Cảnh báo nếu queue sắp đầy
            if (queueStatus.getUsagePercentage() > 80) {
                System.out.println("[ApprovalWorker] WARNING: Approval queue is " +
                        String.format("%.1f", queueStatus.getUsagePercentage()) + "% full!");
            }

        } catch (Exception e) {
            System.err.println("[ApprovalWorker] Error in queue status report: " + e.getMessage());
        }
    }

    /**
     * Schedule để tự động duyệt bài mỗi 12h trưa và 12h tối
     * Sẽ tự động process tất cả pending rooms trong queue
     */
    @Scheduled(cron = "0 0 12,0 * * *") // 12:00 trưa và 00:00 tối mỗi ngày
    public void scheduleAutomaticApproval() {
        try {
            System.out.println("[ApprovalWorker] Starting scheduled automatic approval process...");

            int processedCount = 0;
            int approvedCount = 0;
            int rejectedCount = 0;

            // Process tất cả rooms trong queue cho đến khi queue empty hoặc timeout
            long startTime = System.currentTimeMillis();
            long timeoutMs = 600000;

            while (!approvalQueue.isEmpty() && (System.currentTimeMillis() - startTime) < timeoutMs) {
                ApprovalMessage message = approvalQueue.poll(5, TimeUnit.SECONDS);
                if (message == null) {
                    break;
                }

                try {
                    // Process approval sử dụng logic có sẵn
                    ApprovalResult result = callGeminiApprovalAPI(message);

                    if (result != null) {
                        updateRoomApprovalStatus(message.getRoomId(), result);
                        processedCount++;

                        if (result.getStatus() == 1) {
                            approvedCount++;
                        } else if (result.getStatus() == 2) {
                            rejectedCount++;
                        }

                        System.out.println("[ApprovalWorker] Auto-processed room: " + message.getTitle() +
                                " - Status: " + (result.getStatus() == 1 ? "APPROVED" : "REJECTED"));
                    }

                } catch (Exception e) {
                    System.err.println("[ApprovalWorker] Error auto-processing room " + message.getRoomId() + ": "
                            + e.getMessage());

                    // Retry logic - put back in queue if retry count < max
                    if (message.getRetryCount() < MAX_RETRY_ATTEMPTS) {
                        message.setRetryCount(message.getRetryCount() + 1);
                        approvalQueue.offer(message);
                        System.out.println("[ApprovalWorker] Re-queued room for retry: " + message.getRoomId());
                    } else {
                        System.err.println("[ApprovalWorker] Max retries exceeded for room: " + message.getRoomId());
                    }
                }

                // Small delay để tránh overload API
                Thread.sleep(2000);
            }
            // Report kết quả
            System.out.println("[ApprovalWorker] Automatic approval completed:");
            System.out.println("  Total processed: " + processedCount);
            System.out.println("  Approved: " + approvedCount);
            System.out.println("  Rejected: " + rejectedCount);
            System.out.println("  Duration: " + (System.currentTimeMillis() - startTime) + "ms");

            if (processedCount == 0) {
                System.out.println("[ApprovalWorker] No rooms to process in automatic approval");
            }

        } catch (Exception e) {
            System.err.println("[ApprovalWorker] Error in scheduled automatic approval: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Khởi tạo file CSV với header
     */
    private void initializeCsvFile() {
        try {
            Path csvPath = Paths.get(APPROVAL_LOG_CSV);
            if (!Files.exists(csvPath)) {
                try (FileWriter writer = new FileWriter(APPROVAL_LOG_CSV, true)) {
                    writer.append("Timestamp,Room Title,Status,Reason\n");
                    System.out.println("[ApprovalWorker] 📄 Initialized CSV log file: " + APPROVAL_LOG_CSV);
                }
            }
        } catch (IOException e) {
            System.err.println("[ApprovalWorker] ❌ Failed to initialize CSV file: " + e.getMessage());
        }
    }

    /**
     * Ghi log approval/rejection vào CSV
     */
    private void logToCSV(String roomTitle, String status, String reason) {
        try {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            String cleanTitle = roomTitle != null ? roomTitle.replace(",", ";").replace("\"", "'") : "Unknown";
            String cleanReason = reason != null ? reason.replace(",", ";").replace("\"", "'") : "No reason";

            try (FileWriter writer = new FileWriter(APPROVAL_LOG_CSV, true)) {
                writer.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\"\n",
                        timestamp, cleanTitle, status, cleanReason));
            }

            System.out.println("[ApprovalWorker] 📝 Logged to CSV: " + cleanTitle + " - " + status);
        } catch (IOException e) {
            System.err.println("[ApprovalWorker] ❌ Failed to write CSV log: " + e.getMessage());
        }
    }

    /**
     * Schedule để gửi CSV report hàng ngày vào 23:00
     */
    @Scheduled(cron = "0 0 23 * * *") // 23:00 mỗi ngày
    // @Scheduled(cron = "0 58 15 * * *") // 15:57 PM mỗi ngày (for testing)
    public void scheduleDailyReportToSlack() {
        try {
            System.out.println("[ApprovalWorker] 📊 Starting daily CSV report to Slack...");

            // Kiểm tra file có tồn tại và có data không
            Path csvPath = Paths.get(APPROVAL_LOG_CSV);
            if (!Files.exists(csvPath)) {
                System.out.println("[ApprovalWorker] ℹ️ No CSV file found for daily report");
                return;
            }

            long lineCount = Files.lines(csvPath).count();
            if (lineCount <= 1) { // Chỉ có header
                System.out.println("[ApprovalWorker] ℹ️ CSV file empty, skipping daily report");
                return;
            }

            // Gọi service trực tiếp thay vì HTTP call
            String message = String.format("📋 Daily Room Approval Report - %d rooms processed on %s",
                    lineCount - 1,
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));

            try {
                // Gọi service method trực tiếp
                Map<String, Object> result = approvalLogService.sendCsvToSlackAndClear("C09CM2NAF1P", message);

                if (result != null && Boolean.TRUE.equals(result.get("success"))) {
                    System.out.println("[ApprovalWorker] ✅ Daily CSV report sent to Slack successfully");
                    System.out.println("[ApprovalWorker] 📊 Records processed: " + result.get("records"));
                    System.out.println("[ApprovalWorker] 🗑️ Records cleared: " + result.get("clearedRecords"));
                } else {
                    System.err.println("[ApprovalWorker] ❌ Failed to send daily report: " +
                            (result != null ? result.get("message") : "Unknown error"));
                }

            } catch (Exception serviceError) {
                System.err
                        .println("[ApprovalWorker] ❌ Error calling approval log service: " + serviceError.getMessage());
                serviceError.printStackTrace();
            }

        } catch (Exception e) {
            System.err.println("[ApprovalWorker] ❌ Error in daily report schedule: " + e.getMessage());
            e.printStackTrace();
        }
    }
}