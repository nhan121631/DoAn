package com.ants.ktc.ants_ktc.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.dtos.statistics.MonthlyTransactionStatsDto;
import com.ants.ktc.ants_ktc.dtos.statistics.StatisticAdminResponseDto.MonthlyRevenue;
import com.ants.ktc.ants_ktc.dtos.statistics.StatisticAdminResponseDto.MonthlyUserRegistration;
import com.ants.ktc.ants_ktc.dtos.statistics.StatisticAdminResponseDto.ProvinceStatistic;
import com.ants.ktc.ants_ktc.dtos.statistics.StatisticAdminResponseDto.TopLandlord;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
import com.ants.ktc.ants_ktc.repositories.TransactionsJpaRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;

@Service
public class AdminStatisticsService {
    @Autowired
    private UserJpaRepository userRepository;

    @Autowired
    private RoomJpaRepository roomRepository;

    @Autowired
    private TransactionsJpaRepository transactionRepository;

    // Original AdminStatisticsService methods
    public Long countInactiveUsers() {
        return userRepository.countInactiveUsers();
    }

    public Long countAcceptedRoom() {
        return roomRepository.countAcceptedApprovalRooms();
    }

    public Long countPendingRoom() {
        return roomRepository.countPendingApprovalRooms();
    }

    public Long countTotalRoom() {
        return roomRepository.countTotalApprovalRooms();
    }

    // Methods for separate endpoints
    public List<ProvinceStatistic> getRoomsByProvince() {
        try {
            // Try the left join query first to handle missing address data
            List<Object[]> results = roomRepository.getRoomStatisticsByProvinceWithLeftJoin();
            List<ProvinceStatistic> provinceStats = new ArrayList<>();

            for (Object[] result : results) {
                String provinceName = (String) result[0];
                Long roomCount = ((Number) result[1]).longValue();
                Double averagePrice = result[2] != null ? ((Number) result[2]).doubleValue() : 0.0;

                provinceStats.add(new ProvinceStatistic(
                        provinceName != null ? provinceName : "No Province",
                        roomCount != null ? roomCount : 0L,
                        BigDecimal.valueOf(averagePrice)));
            }

            return provinceStats;
        } catch (Exception e) {
            // If there's an error, return empty list rather than failing
            System.err.println("Error in getRoomsByProvince: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public List<MonthlyRevenue> getMonthlyRevenues() {
        return getMonthlyRevenues(6);
    }

    public List<MonthlyRevenue> getMonthlyRevenues(int months) {
        List<MonthlyRevenue> monthlyRevenues = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        try {
            // Calculate start date for specified months ago
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.MONTH, -months);
            Date startDate = cal.getTime();

            // Get actual revenue data from database
            List<Object[]> revenueData = transactionRepository.getMonthlyRevenueStatistics(startDate);
            Map<String, BigDecimal> revenueMap = new HashMap<>();

            // Convert query results to map for easy lookup
            for (Object[] result : revenueData) {
                String month = (String) result[0];
                BigDecimal revenue = BigDecimal.ZERO;
                if (result[1] != null) {
                    if (result[1] instanceof BigDecimal) {
                        revenue = (BigDecimal) result[1];
                    } else if (result[1] instanceof Double) {
                        revenue = BigDecimal.valueOf((Double) result[1]);
                    } else if (result[1] instanceof Number) {
                        revenue = BigDecimal.valueOf(((Number) result[1]).doubleValue());
                    }
                }
                revenueMap.put(month, revenue);
            }

            // Generate data for specified months, filling in zeros for months with no
            // revenue
            for (int i = months - 1; i >= 0; i--) {
                LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
                String monthKey = monthStart.format(formatter);

                BigDecimal revenue = revenueMap.getOrDefault(monthKey, BigDecimal.ZERO);
                monthlyRevenues.add(new MonthlyRevenue(monthKey, revenue));
            }

        } catch (Exception e) {
            // Fallback to zero revenue if there's an error
            System.err.println("Error getting monthly revenues: " + e.getMessage());
            e.printStackTrace();

            for (int i = months - 1; i >= 0; i--) {
                LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
                monthlyRevenues.add(new MonthlyRevenue(
                        monthStart.format(formatter),
                        BigDecimal.ZERO));
            }
        }

        return monthlyRevenues;
    }

    public List<MonthlyUserRegistration> getMonthlyUserRegistrations() {
        return getMonthlyUserRegistrations(6);
    }

    public List<MonthlyUserRegistration> getMonthlyUserRegistrations(int months) {
        List<MonthlyUserRegistration> monthlyRegistrations = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        try {
            // Calculate start date for specified months ago
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.MONTH, -months);
            Date startDate = cal.getTime();

            // Get actual user registration data from database
            List<Object[]> userData = userRepository.getMonthlyUserRegistrationStatistics(startDate);
            Map<String, Long> userMap = new HashMap<>();

            // Convert query results to map for easy lookup
            for (Object[] result : userData) {
                String month = (String) result[0];
                Long userCount = result[1] != null ? ((Number) result[1]).longValue() : 0L;
                userMap.put(month, userCount);
            }

            // Generate data for specified months, filling in zeros for months with no
            // registrations
            for (int i = months - 1; i >= 0; i--) {
                LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
                String monthKey = monthStart.format(formatter);

                Long userCount = userMap.getOrDefault(monthKey, 0L);
                monthlyRegistrations.add(new MonthlyUserRegistration(monthKey, userCount));
            }

        } catch (Exception e) {
            // Fallback to zero count if there's an error
            System.err.println("Error getting monthly user registrations: " + e.getMessage());
            e.printStackTrace();

            for (int i = months - 1; i >= 0; i--) {
                LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
                monthlyRegistrations.add(new MonthlyUserRegistration(
                        monthStart.format(formatter),
                        0L));
            }
        }

        return monthlyRegistrations;
    }

    public List<TopLandlord> getTopLandlords() {
        return getTopLandlords(8);
    }

    public List<TopLandlord> getTopLandlords(int limit) {
        try {
            List<Object[]> results = userRepository.getTopLandlordsByRoomCount();
            List<TopLandlord> topLandlords = new ArrayList<>();

            for (Object[] result : results) {
                UUID landlordId = (UUID) result[0]; // Added id field
                String landlordName = (String) result[1];
                String email = (String) result[2];
                Long roomCount = ((Number) result[3]).longValue();
                Double totalRevenueDouble = result[4] != null ? ((Number) result[4]).doubleValue() : 0.0;
                BigDecimal totalRevenue = BigDecimal.valueOf(totalRevenueDouble);

                topLandlords.add(new TopLandlord(
                        landlordId,
                        landlordName != null ? landlordName : "Unknown",
                        email != null ? email : "",
                        roomCount != null ? roomCount : 0L,
                        totalRevenue));
            }

            // Limit to specified number and sort by room count descending
            return topLandlords.stream()
                    .sorted((a, b) -> Long.compare(b.getRoomCount(), a.getRoomCount()))
                    .limit(limit)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // If there's an error, return empty list rather than failing
            System.err.println("Error getting top landlords: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    // Helper method to get transaction type description
    private String getTransactionTypeDescription(Integer type) {
        switch (type) {
            case 0:
                return "Gia hạn/Đăng bài";
            case 1:
                return "Nạp VNPAY";
            case 2:
                return "Hoàn trả";
            default:
                return "Khác";
        }
    }

    public List<MonthlyTransactionStatsDto> getMonthlyTransactionsByType(int months) {
        List<MonthlyTransactionStatsDto> result = new ArrayList<>();

        try {
            // Calculate start date
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.MONTH, -months);
            Date startDate = cal.getTime();

            // Get data from repository
            List<Object[]> queryResults = transactionRepository.getMonthlyTransactionStatisticsByType(startDate);

            // Create a map to store transaction data by month and type
            Map<String, Map<Integer, BigDecimal>> monthlyTransactionMap = new HashMap<>();

            // Populate the map with actual data
            for (Object[] row : queryResults) {
                String month = (String) row[0];
                Integer transactionType = (Integer) row[1];
                BigDecimal totalAmount = convertToSafeBigDecimal(row[2]);

                monthlyTransactionMap.computeIfAbsent(month, k -> new HashMap<>())
                        .put(transactionType, totalAmount);
            }

            // Generate data for all months and all transaction types
            LocalDateTime now = LocalDateTime.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

            for (int i = months - 1; i >= 0; i--) {
                LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
                String monthKey = monthStart.format(formatter);

                // Add entries for each transaction type (0, 1, 2)
                for (int transactionType = 0; transactionType <= 2; transactionType++) {
                    BigDecimal amount = BigDecimal.ZERO;
                    if (monthlyTransactionMap.containsKey(monthKey) &&
                            monthlyTransactionMap.get(monthKey).containsKey(transactionType)) {
                        amount = monthlyTransactionMap.get(monthKey).get(transactionType);
                    }

                    result.add(new MonthlyTransactionStatsDto(
                            monthKey,
                            transactionType,
                            getTransactionTypeDescription(transactionType),
                            amount));
                }
            }

        } catch (Exception e) {
            System.err.println("Error getting monthly transactions by type: " + e.getMessage());
            e.printStackTrace();
        }

        return result;
    }

    public List<MonthlyTransactionStatsDto> getMonthlyTransactionsByTypeForLandlord(UUID landlordId, int months) {
        List<MonthlyTransactionStatsDto> result = new ArrayList<>();

        try {
            // Calculate start date
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.MONTH, -months);
            Date startDate = cal.getTime();

            // Get data from repository
            List<Object[]> queryResults = transactionRepository
                    .getMonthlyTransactionStatisticsByTypeForLandlord(landlordId, startDate);

            // Create a map to store transaction data by month and type
            Map<String, Map<Integer, BigDecimal>> monthlyTransactionMap = new HashMap<>();

            // Populate the map with actual data
            for (Object[] row : queryResults) {
                String month = (String) row[0];
                Integer transactionType = (Integer) row[1];
                BigDecimal totalAmount = convertToSafeBigDecimal(row[2]);

                monthlyTransactionMap.computeIfAbsent(month, k -> new HashMap<>())
                        .put(transactionType, totalAmount);
            }

            // Generate data for all months and all transaction types
            LocalDateTime now = LocalDateTime.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

            for (int i = months - 1; i >= 0; i--) {
                LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
                String monthKey = monthStart.format(formatter);

                // Add entries for each transaction type (0, 1, 2)
                for (int transactionType = 0; transactionType <= 2; transactionType++) {
                    BigDecimal amount = BigDecimal.ZERO;
                    if (monthlyTransactionMap.containsKey(monthKey) &&
                            monthlyTransactionMap.get(monthKey).containsKey(transactionType)) {
                        amount = monthlyTransactionMap.get(monthKey).get(transactionType);
                    }

                    result.add(new MonthlyTransactionStatsDto(
                            monthKey,
                            transactionType,
                            getTransactionTypeDescription(transactionType),
                            amount));
                }
            }

        } catch (Exception e) {
            System.err.println("Error getting monthly transactions by type for landlord: " + e.getMessage());
            e.printStackTrace();
        }

        return result;
    }

    // Helper method to safely convert to BigDecimal
    private BigDecimal convertToSafeBigDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }

        if (value instanceof BigDecimal) {
            return (BigDecimal) value;
        } else if (value instanceof Double) {
            return BigDecimal.valueOf((Double) value);
        } else if (value instanceof Number) {
            return BigDecimal.valueOf(((Number) value).doubleValue());
        }

        return BigDecimal.ZERO;
    }

}
