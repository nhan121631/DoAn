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

import com.ants.ktc.ants_ktc.dtos.bill.BillStatisticResponseDto;
import com.ants.ktc.ants_ktc.dtos.manage_maintain.MaintainStatisticDto;
import com.ants.ktc.ants_ktc.dtos.transaction.TransactionStatisticsDto;
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
            LocalDate now = LocalDate.now();
            LocalDate start = now.minusMonths(11).withDayOfMonth(1); // đầu tháng của 12 tháng trước
            LocalDate end = now.withDayOfMonth(now.lengthOfMonth()); // cuối tháng hiện tại
            startDate = start.toString();
            endDate = end.toString();
        }

        // Trả về thống kê theo tháng-năm (month)
        return landLordStatisticsService.getMaintenanceStatisticsByLandlordIdAndDateRange(landlordId,
                Date.valueOf(startDate), Date.valueOf(endDate));
    }

    @GetMapping("/fee-post-room-statistics/{landlordId}")
    public List<TransactionStatisticsDto> getFeePostRoomStatisticsByLandlordAndDateRange(
            @PathVariable("landlordId") UUID landlordId,
            @RequestParam(required = false, name = "startDate") String startDate,
            @RequestParam(required = false, name = "endDate") String endDate) {

        if (startDate == null || endDate == null) {
            LocalDate now = LocalDate.now();
            LocalDate start = now.minusMonths(11).withDayOfMonth(1); // đầu tháng của 12 tháng trước
            LocalDate end = now.withDayOfMonth(now.lengthOfMonth()); // cuối tháng hiện tại
            startDate = start.toString();
            endDate = end.toString();
        }

        // Trả về thống kê theo tháng-năm (month)
        return landLordStatisticsService.getTransactionStatisticsByLandlordIdAndDateRange(landlordId,
                Date.valueOf(startDate), Date.valueOf(endDate));
    }

    @GetMapping("/revenue-statistics/{landlordId}")
    public List<BillStatisticResponseDto> getRevenues(
            @PathVariable("landlordId") UUID landlordId,
            @RequestParam(required = false, name = "startDate") String startDate,
            @RequestParam(required = false, name = "endDate") String endDate) {

        if (startDate == null || endDate == null) {
            LocalDate now = LocalDate.now();
            LocalDate start = now.minusMonths(11).withDayOfMonth(1); // đầu tháng của 12 tháng trước
            LocalDate end = now.withDayOfMonth(now.lengthOfMonth()); // cuối tháng hiện tại
            startDate = start.toString();
            endDate = end.toString();
        }

        // Trả về thống kê theo tháng-năm (month)
        return landLordStatisticsService.getRevenueBills(landlordId,
                Date.valueOf(startDate), Date.valueOf(endDate));
    }
}
