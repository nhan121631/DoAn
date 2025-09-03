package com.ants.ktc.ants_ktc.controllers;

import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ants.ktc.ants_ktc.services.ApprovalQueueService;
import com.ants.ktc.ants_ktc.services.ApprovalQueueService.QueueStatus;

@RestController
@RequestMapping("/api/approval-queue")
public class ApprovalQueueController {

    @Autowired
    private ApprovalQueueService approvalQueueService;

    @PostMapping("/enqueue/{roomId}")
    public ResponseEntity<Map<String, Object>> enqueueRoom(@PathVariable UUID roomId) {
        boolean success = approvalQueueService.enqueueRoomForApproval(roomId);

        if (success) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Room " + roomId + " added to approval queue successfully",
                    "roomId", roomId));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Failed to add room " + roomId + " to approval queue",
                    "roomId", roomId));
        }
    }

    @PostMapping("/enqueue-all")
    public ResponseEntity<Map<String, Object>> enqueueAllPendingRooms() {
        int enqueuedCount = approvalQueueService.enqueuePendingRooms();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Enqueued " + enqueuedCount + " rooms for approval",
                "enqueuedCount", enqueuedCount));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getQueueStatus() {
        QueueStatus status = approvalQueueService.getQueueStatus();

        return ResponseEntity.ok(Map.of(
                "currentSize", status.getCurrentSize(),
                "totalCapacity", status.getTotalCapacity(),
                "remainingCapacity", status.getRemainingCapacity(),
                "usagePercentage", status.getUsagePercentage(),
                "status", status.toString()));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Map<String, Object>> clearQueue() {
        int clearedCount = approvalQueueService.clearQueue();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Cleared " + clearedCount + " items from approval queue",
                "clearedCount", clearedCount));
    }
}
