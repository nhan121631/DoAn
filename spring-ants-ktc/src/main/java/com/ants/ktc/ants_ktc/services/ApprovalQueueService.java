package com.ants.ktc.ants_ktc.services;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ants.ktc.ants_ktc.entities.Convenient;
import com.ants.ktc.ants_ktc.entities.Image;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.entities.address.Address;
import com.ants.ktc.ants_ktc.models.ApprovalMessage;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;

@Service
public class ApprovalQueueService {

    @Autowired
    @Qualifier("approvalQueue")
    private BlockingQueue<ApprovalMessage> approvalQueue;

    @Autowired
    private RoomJpaRepository roomJpaRepository;

    public boolean enqueueRoomForApproval(UUID roomId) {
        try {
            Room room = roomJpaRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Room not found: " + roomId));

            ApprovalMessage approvalMessage = createApprovalMessage(room);

            boolean added = approvalQueue.offer(approvalMessage);

            if (added) {
                System.out.println("[ApprovalQueueService] ✅ Room " + roomId + " added to approval queue");
                return true;
            } else {
                System.err.println("[ApprovalQueueService] ❌ Failed to add room " + roomId + " to queue (queue full)");
                return false;
            }

        } catch (Exception e) {
            System.err.println("[ApprovalQueueService] ❌ Error enqueuing room " + roomId + ": " + e.getMessage());
            return false;
        }
    }

    /**
     * Thêm nhiều phòng vào hàng đợi duyệt
     */
    @Transactional(readOnly = true)
    public int enqueuePendingRooms() {
        try {
            // Lấy tất cả phòng chờ duyệt (approval = 0)
            List<Room> pendingRooms = roomJpaRepository.findAll().stream()
                    .filter(room -> room.getApproval() == 0 && room.getIsRemoved() == 0)
                    .collect(Collectors.toList());

            int enqueuedCount = 0;
            for (Room room : pendingRooms) {
                ApprovalMessage approvalMessage = createApprovalMessage(room);

                if (approvalQueue.offer(approvalMessage)) {
                    enqueuedCount++;
                    System.out.println("[ApprovalQueueService] ✅ Room " + room.getId() + " added to approval queue");
                } else {
                    System.err.println("[ApprovalQueueService] ❌ Queue full, skipped room " + room.getId());
                    break; // Queue đã đầy
                }
            }

            System.out
                    .println("[ApprovalQueueService] 📊 Total enqueued: " + enqueuedCount + "/" + pendingRooms.size());
            return enqueuedCount;

        } catch (Exception e) {
            System.err.println("[ApprovalQueueService] ❌ Error enqueuing pending rooms: " + e.getMessage());
            return 0;
        }
    }

    private ApprovalMessage createApprovalMessage(Room room) {
        List<String> convenientNames = room.getConvenients() != null
                ? room.getConvenients().stream()
                        .map(Convenient::getName)
                        .collect(Collectors.toList())
                : List.of();
        List<String> imageUrls = room.getImages() != null
                ? room.getImages().stream()
                        .map(Image::getUrl)
                        .collect(Collectors.toList())
                : List.of();

        String fullAddress = buildFullAddress(room.getAddress());

        return ApprovalMessage.builder()
                .roomId(room.getId())
                .title(room.getTitle())
                .description(room.getDescription())
                .priceMonth(room.getPrice_month().longValue())
                .priceDeposit(room.getPrice_deposit().longValue())
                .area(room.getArea())
                .length(room.getRoomLength())
                .width(room.getRoomWidth())
                .maxPeople(room.getMaxPeople())
                .elecPrice(room.getElecPrice().longValue())
                .waterPrice(room.getWaterPrice().longValue())
                .fullAddress(fullAddress)
                .convenients(convenientNames)
                .images(imageUrls)
                .build();
    }

    /**
     * Tạo chuỗi địa chỉ đầy đủ từ Address entity an toàn
     */
    private String buildFullAddress(Address address) {
        if (address == null)
            return "";

        StringBuilder addressBuilder = new StringBuilder();

        // Thêm street
        if (address.getStreet() != null && !address.getStreet().trim().isEmpty()) {
            addressBuilder.append(address.getStreet().trim());
        }

        // Thêm ward, district, province
        if (address.getWard() != null) {
            if (addressBuilder.length() > 0) {
                addressBuilder.append(", ");
            }
            addressBuilder.append(address.getWard().getName());

            if (address.getWard().getDistrict() != null) {
                addressBuilder.append(", ").append(address.getWard().getDistrict().getName());

                if (address.getWard().getDistrict().getProvince() != null) {
                    addressBuilder.append(", ").append(address.getWard().getDistrict().getProvince().getName());
                }
            }
        }

        return addressBuilder.toString();
    }

    /**
     * Lấy thông tin trạng thái queue
     */
    public QueueStatus getQueueStatus() {
        int queueSize = approvalQueue.size();
        int remainingCapacity = approvalQueue.remainingCapacity();
        int totalCapacity = queueSize + remainingCapacity;

        return new QueueStatus(queueSize, totalCapacity, remainingCapacity);
    }

    /**
     * Xóa tất cả phòng trong queue (emergency clear)
     */
    public int clearQueue() {
        int cleared = approvalQueue.size();
        approvalQueue.clear();
        System.out.println("[ApprovalQueueService] Cleared " + cleared + " items from approval queue");
        return cleared;
    }

    // Inner class for queue status
    public static class QueueStatus {
        private final int currentSize;
        private final int totalCapacity;
        private final int remainingCapacity;

        public QueueStatus(int currentSize, int totalCapacity, int remainingCapacity) {
            this.currentSize = currentSize;
            this.totalCapacity = totalCapacity;
            this.remainingCapacity = remainingCapacity;
        }

        public int getCurrentSize() {
            return currentSize;
        }

        public int getTotalCapacity() {
            return totalCapacity;
        }

        public int getRemainingCapacity() {
            return remainingCapacity;
        }

        public double getUsagePercentage() {
            return totalCapacity > 0 ? (double) currentSize / totalCapacity * 100 : 0;
        }

        @Override
        public String toString() {
            return String.format("QueueStatus{size=%d/%d (%.1f%%), remaining=%d}",
                    currentSize, totalCapacity, getUsagePercentage(), remainingCapacity);
        }
    }
}
