package com.ants.ktc.ants_ktc.dtos.statistics;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatisticAdminResponseDto {

    // Overall statistics
    private Long totalUsers;
    private Long totalLandlords;
    private Long totalTenants;
    private Long totalRooms;
    private Long totalActiveRooms;
    private Long totalInactiveRooms;
    private Long totalBookings;
    private Long totalContracts;
    private BigDecimal totalRevenue;

    // Monthly growth statistics
    private Long newUsersThisMonth;
    private Long newRoomsThisMonth;
    private Long newBookingsThisMonth;
    private BigDecimal revenueThisMonth;

    // Room statistics by status
    private Map<String, Long> roomsByStatus;

    // Room statistics by post type
    private Map<String, Long> roomsByPostType;

    // Room statistics by province
    private List<ProvinceStatistic> roomsByProvince;

    // Revenue statistics by month (last 12 months)
    private List<MonthlyRevenue> monthlyRevenues;

    // User registration statistics by month (last 12 months)
    private List<MonthlyUserRegistration> monthlyUserRegistrations;

    // Top landlords by room count
    private List<TopLandlord> topLandlords;

    // Recent activities
    private List<RecentActivity> recentActivities;

    // Static classes for nested data
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProvinceStatistic {
        private String provinceName;
        private Long roomCount;
        private BigDecimal averagePrice;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenue {
        private String month;
        private BigDecimal revenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyUserRegistration {
        private String month;
        private Long userCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopLandlord {
        private UUID id;
        private String landlordName;
        private String email;
        private Long roomCount;
        private BigDecimal totalRevenue;

        // Constructor without id for backward compatibility
        public TopLandlord(String landlordName, String email, Long roomCount, BigDecimal totalRevenue) {
            this.landlordName = landlordName;
            this.email = email;
            this.roomCount = roomCount;
            this.totalRevenue = totalRevenue;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {
        private String activityType;
        private String description;
        private LocalDateTime timestamp;
        private String userEmail;
    }
}
