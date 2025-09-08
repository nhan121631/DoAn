package com.ants.ktc.ants_ktc.controllers.landlord;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ants.ktc.ants_ktc.dtos.manage_maintain.MaintainStatisticDto;
import com.ants.ktc.ants_ktc.dtos.transaction.TransactionStatisticsDto;
import com.ants.ktc.ants_ktc.entities.Transaction;
import com.ants.ktc.ants_ktc.services.LandLordStatisticsService;

@RestController
@RequestMapping("/api/landlord/statistics")
public class LandlordStatisticsController {
    @Autowired
    private LandLordStatisticsService landLordStatisticsService;

    // api get count room
    @GetMapping("/total-posted-rooms/{landlordId}")
    public int getTotalPostedRoomsByLandlord(@PathVariable("landlordId") UUID landlordId) {
        return landLordStatisticsService.getTotalPostedRoomsByLandlordId(landlordId);
    }

    @GetMapping("/total-rented-rooms/{landlordId}")
    public int getTotalRentedRoomsByLandlord(@PathVariable("landlordId") UUID landlordId) {
        return landLordStatisticsService.getTotalRentedRoomsByLandlordId(landlordId);
    }

    @GetMapping("/total-viewed-rooms/{landlordId}")
    public int getTotalViewedRoomsByLandlord(@PathVariable("landlordId") UUID landlordId) {
        return landLordStatisticsService.getTotalViewedRoomsByLandlordId(landlordId);
    }

    @GetMapping("/total-favorited-rooms/{landlordId}")
    public int getTotalFavoritedRoomsByLandlord(@PathVariable("landlordId") UUID landlordId) {
        return landLordStatisticsService.getTotalFavoritedRoomsByLandlordId(landlordId);
    }

    @GetMapping("/maintenance-statistics/{landlordId}")
    public List<MaintainStatisticDto> getMaintenanceStatisticsByLandlordAndDateRange(
            @PathVariable("landlordId") UUID landlordId,
            @RequestParam(required = false, name = "startDate") String startDate,
            @RequestParam(required = false, name = "endDate") String endDate) {

        if (startDate == null || endDate == null) {
            startDate = LocalDate.now().withDayOfMonth(1).toString(); // First day of current month
            endDate = LocalDate.now().toString(); // Current date
        }

        return landLordStatisticsService.getMaintenanceStatisticsByLandlordIdAndDateRange(landlordId,
                Date.valueOf(startDate), Date.valueOf(endDate));
    }

    @GetMapping("/fee-post-room-statistics/{landlordId}")
    public List<TransactionStatisticsDto> getFeePostRoomStatisticsByLandlordAndDateRange(
            @PathVariable("landlordId") UUID landlordId,
            @RequestParam(required = false, name = "startDate") String startDate,
            @RequestParam(required = false, name = "endDate") String endDate) {

        if (startDate == null || endDate == null) {
            startDate = LocalDate.now().withDayOfMonth(1).toString(); // First day of current month
            endDate = LocalDate.now().toString(); // Current date
        }

        return landLordStatisticsService.getTransactionStatisticsByLandlordIdAndDateRange(landlordId,
                Date.valueOf(startDate), Date.valueOf(endDate));
    }
}
