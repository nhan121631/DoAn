package com.ants.ktc.ants_ktc.models;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalMessage {
    private UUID roomId;
    private String title;
    private String description;
    private Long priceMonth;
    private Long priceDeposit;
    private Double area;
    private Double length;
    private Double width;
    private Integer maxPeople;
    private Long elecPrice;
    private Long waterPrice;
    private String fullAddress;
    private List<String> convenients;
    private List<String> images;

    @Builder.Default
    private int retryCount = 0;

    @Builder.Default
    private long timestamp = System.currentTimeMillis();

    // Custom toString để hiển thị thông tin quan trọng
    @Override
    public String toString() {
        return "ApprovalMessage{" +
                "roomId=" + roomId +
                ", title='" + title + '\'' +
                ", retryCount=" + retryCount +
                ", timestamp=" + timestamp +
                '}';
    }
}
