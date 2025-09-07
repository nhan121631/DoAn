package com.ants.ktc.ants_ktc.services;

import java.sql.Date;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.dtos.manage_maintain.MaintainStatisticDto;
import com.ants.ktc.ants_ktc.dtos.transaction.TransactionStatisticsDto;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
import com.ants.ktc.ants_ktc.repositories.projection.landlord.FeePostRoomProjection;
import com.ants.ktc.ants_ktc.repositories.projection.landlord.MaintainStatisticProjection;

@Service
public class LandLordStatisticsService {
    @Autowired
    private RoomJpaRepository roomJpaRepository;

    public int getTotalPostedRoomsByLandlordId(UUID landlordId) {
        return roomJpaRepository.countRoomsByUserId(landlordId);
    }

    public int getTotalRentedRoomsByLandlordId(UUID landlordId) {
        return roomJpaRepository.countRentedRoomsByUserId(landlordId);
    }

    public int getTotalViewedRoomsByLandlordId(UUID landlordId) {
        return roomJpaRepository.sumViewOfRoomsByUserId(landlordId);
    }

    public int getTotalFavoritedRoomsByLandlordId(UUID landlordId) {
        return roomJpaRepository.sumFavoriteOfRoomsByUserId(landlordId);
    }

    private long diffBetweenTwoDate(String startDate, String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return ChronoUnit.DAYS.between(start, end);
    }

    public List<MaintainStatisticDto> getMaintenanceStatisticsByLandlordIdAndDateRange(UUID landlordId,
            Date startDate, Date endDate) {
        System.out.println("=== DEBUG MAINTENANCE STATISTICS ===");
        System.out.println("Landlord ID: " + landlordId);
        System.out.println("Start Date: " + startDate + ", End Date: " + endDate);
        System.out.println("diffBetweenTwoDate: " + diffBetweenTwoDate(startDate.toString(), endDate.toString()));

        if (diffBetweenTwoDate(startDate.toString(), endDate.toString()) > 31) {
            throw new IllegalArgumentException("Date range should not exceed 31 days.");
        }
        if (startDate.after(endDate)) {
            throw new IllegalArgumentException("Start date must be before end date.");
        }

        List<MaintainStatisticProjection> projections = roomJpaRepository.sumCostMaintenanceOfRoomsByUserId(landlordId,
                startDate, endDate);
        System.out.println("Query result count: " + projections.size());
        for (MaintainStatisticProjection p : projections) {
            System.out.println("Projection: cost=" + p.getCost() + ", date=" + p.getDate());
        }
        System.out.println("=== END DEBUG ===");

        return projections.stream().map(projection -> MaintainStatisticDto.builder()
                .cost(projection.getCost())
                .date(projection.getDate())
                .build()).toList();
    }

    public List<TransactionStatisticsDto> getTransactionStatisticsByLandlordIdAndDateRange(UUID landlordId,
            Date startDate, Date endDate) {
        if (diffBetweenTwoDate(startDate.toString(), endDate.toString()) > 31) {
            throw new IllegalArgumentException("Date range should not exceed 31 days.");
        }
        if (startDate.after(endDate)) {
            throw new IllegalArgumentException("Start date must be before end date.");
        }

        List<FeePostRoomProjection> projections = roomJpaRepository.countFeePostOfRoomsByUserId(landlordId,
                startDate, endDate);

        return projections.stream().map(projection -> TransactionStatisticsDto.builder()
                .cost(projection.getCost())
                .date(projection.getDate())
                .build()).toList();

    }
}
