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
            // 1. Kiểm tra room có trong hàng đợi chưa
            if (isRoomAlreadyInQueue(roomId)) {
                System.out.println("[ApprovalQueueService] Room " + roomId + " already exists in queue");
                return false;
            }

            // 2. Lấy dữ liệu room
            Room room = roomJpaRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Room not found: " + roomId));

            // 3. Chỉ thêm room nếu KHÔNG có video
            boolean hasNoVideo = isRoomWithoutVideo(roomId);

            if (!hasNoVideo) {
                System.out.println("[ApprovalQueueService] Room " + roomId
                        + " NOT added because it already has a video.");
                return false; // Có video → không thêm vào queue
            }

            System.out.println("[ApprovalQueueService] Room " + roomId
                    + " has NO video → will be added to queue.");

            // 4. Tạo message và thêm vào queue
            ApprovalMessage approvalMessage = createApprovalMessage(room);
            boolean added = approvalQueue.offer(approvalMessage);

            if (added) {
                System.out.println("[ApprovalQueueService] Room " + roomId + " added to approval queue");
                return true;
            } else {
                System.err.println("[ApprovalQueueService] Queue full, cannot add room " + roomId);
                return false;
            }

        } catch (Exception e) {
            System.err.println("[ApprovalQueueService] Error enqueuing room " + roomId + ": " + e.getMessage());
            return false;
        }
    }

    /**
     * Kiểm tra xem room chưa video
     */
    private boolean isVideoUrl(String url) {
        if (url == null)
            return false;

        String lower = url.toLowerCase();
        return lower.endsWith(".mp4") ||
                lower.endsWith(".mov") ||
                lower.endsWith(".avi") ||
                lower.endsWith(".mkv") ||
                lower.endsWith(".webm");
    }

    public boolean isRoomWithoutVideo(UUID roomId) {
        Room room = roomJpaRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomId));

        boolean hasVideo = room.getImages().stream()
                .anyMatch(img -> isVideoUrl(img.getUrl()));
        System.out.println("====================has video ==================");

        return !hasVideo;
    }

    /**
     * Kiểm tra xem roomId đã tồn tại trong queue hay chưa
     */
    private boolean isRoomAlreadyInQueue(UUID roomId) {
        return approvalQueue.stream()
                .anyMatch(message -> message.getRoomId().equals(roomId));
    }

    /**
     * Thêm nhiều phòng vào hàng đợi duyệt với kiểm tra duplicate
     */
    @Transactional(readOnly = true)
    public int enqueuePendingRooms() {
        try {
            // Lấy tất cả phòng chờ duyệt (approval = 0)
            List<Room> pendingRooms = roomJpaRepository.findAll().stream()
                    .filter(room -> room.getApproval() == 0 && room.getIsRemoved() == 0)
                    .collect(Collectors.toList());

            int enqueuedCount = 0;
            int skippedDuplicateCount = 0;
            int skippedHasVideoCount = 0;

            for (Room room : pendingRooms) {

                UUID roomId = room.getId();

                // 1. Skip nếu đã có trong queue
                if (isRoomAlreadyInQueue(roomId)) {
                    skippedDuplicateCount++;
                    System.out.println("[ApprovalQueueService] Skipped room " + roomId + " (already in queue)");
                    continue;
                }

                // 2. Skip nếu room đã có VIDEO
                if (!isRoomWithoutVideo(roomId)) {
                    skippedHasVideoCount++;
                    System.out.println("[ApprovalQueueService] Skipped room " + roomId + " (already has video)");
                    continue;
                }

                // 3. Nếu không có video → cho vào queue
                ApprovalMessage approvalMessage = createApprovalMessage(room);

                if (approvalQueue.offer(approvalMessage)) {
                    enqueuedCount++;
                    System.out.println("[ApprovalQueueService] Room " + roomId + " added to approval queue");
                } else {
                    System.err.println("[ApprovalQueueService] Queue full, skipped room " + roomId);
                    break; // Queue đầy
                }
            }

            System.out.println(
                    "[ApprovalQueueService] Summary: "
                            + pendingRooms.size() + " pending rooms, "
                            + enqueuedCount + " enqueued, "
                            + skippedDuplicateCount + " duplicates skipped, "
                            + skippedHasVideoCount + " skipped (has video)");

            return enqueuedCount;

        } catch (Exception e) {
            System.err.println("[ApprovalQueueService] Error enqueuing pending rooms: " + e.getMessage());
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

    /**
     * Lấy danh sách tất cả room IDs hiện tại trong queue (để debug/monitoring)
     */
    public List<UUID> getCurrentQueueRoomIds() {
        return approvalQueue.stream()
                .map(ApprovalMessage::getRoomId)
                .collect(Collectors.toList());
    }

    /**
     * Đếm số lượng room ID cụ thể trong queue
     */
    public int countRoomInQueue(UUID roomId) {
        return (int) approvalQueue.stream()
                .filter(message -> message.getRoomId().equals(roomId))
                .count();
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
