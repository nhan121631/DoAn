package com.ants.ktc.ants_ktc.controllers.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
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
}
