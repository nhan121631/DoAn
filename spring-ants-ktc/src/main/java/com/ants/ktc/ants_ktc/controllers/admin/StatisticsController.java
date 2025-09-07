package com.ants.ktc.ants_ktc.controllers.admin;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ants.ktc.ants_ktc.services.AdminStatisticsService;

@RestController
@RequestMapping("api/admin/statistics")
public class StatisticsController {
    @Autowired
    private AdminStatisticsService adminStatisticsService;

    @GetMapping("/inactive-users/count")
    public Long countInactiveUsers() {
        return adminStatisticsService.countInactiveUsers();
    }

    @GetMapping("/rooms/accepted/count")
    public Long countAcceptedRooms() {
        return adminStatisticsService.countAcceptedRoom();
    }

    @GetMapping("/rooms/pending/count")
    public Long countPendingRooms() {
        return adminStatisticsService.countPendingRoom();
    }

    @GetMapping("/rooms/total/count")
    public Long countTotalRooms() {
        return adminStatisticsService.countTotalRoom();
    }

    // Comprehensive Statistics Endpoints

    @GetMapping("/rooms/by-province")
    public ResponseEntity<?> getRoomsByProvince() {
        try {
            return ResponseEntity.ok(adminStatisticsService.getRoomsByProvince());
        } catch (Exception e) {
            System.err.println("Error getting rooms by province: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/revenue/monthly")
    public ResponseEntity<?> getMonthlyTransactionsByType(
            @RequestParam(name = "months", defaultValue = "12") int months,
            @RequestParam(name = "landlordId", required = false) UUID landlordId) {
        try {
            // Validate months parameter
            if (months < 1 || months > 36) {
                months = 12; // Default to 12 months if invalid
            }
            if (landlordId != null) {
                return ResponseEntity
                        .ok(adminStatisticsService.getMonthlyTransactionsByTypeForLandlord(landlordId, months));
            } else {
                return ResponseEntity.ok(adminStatisticsService.getMonthlyTransactionsByType(months));
            }
        } catch (Exception e) {
            System.err.println("Error getting monthly transactions by type: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/users/monthly")
    public ResponseEntity<?> getMonthlyUserRegistrations(
            @RequestParam(name = "months", defaultValue = "12") int months) {
        try {
            // Validate months parameter
            if (months < 1 || months > 36) {
                months = 12; // Default to 12 months if invalid
            }
            return ResponseEntity.ok(adminStatisticsService.getMonthlyUserRegistrations(months));
        } catch (Exception e) {
            System.err.println("Error getting monthly user registrations: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/landlords/top")
    public ResponseEntity<?> getTopLandlords(
            @RequestParam(name = "limit", defaultValue = "8") int limit) {
        try {
            // Validate limit parameter
            if (limit < 1 || limit > 50) {
                limit = 8; // Default to 8 if invalid
            }
            return ResponseEntity.ok(adminStatisticsService.getTopLandlords(limit));
        } catch (Exception e) {
            System.err.println("Error getting top landlords: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

}
