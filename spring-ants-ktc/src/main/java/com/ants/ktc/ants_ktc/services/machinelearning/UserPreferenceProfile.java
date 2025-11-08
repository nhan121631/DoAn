package com.ants.ktc.ants_ktc.services.machinelearning;

import java.util.ArrayList;
import java.util.List;

import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.entities.address.Address;

import lombok.Getter;
import lombok.Setter;

/**
 * User preference profile built from favorites
 * Used for Content-Based Filtering ML algorithm
 */
@Getter
@Setter
public class UserPreferenceProfile {
    private List<Double> priceMonths = new ArrayList<>();
    private List<Double> areas = new ArrayList<>();
    private List<Double> roomLengths = new ArrayList<>();
    private List<Double> roomWidths = new ArrayList<>();
    private List<Double> elecPrices = new ArrayList<>();
    private List<Double> waterPrices = new ArrayList<>();
    private List<Integer> maxPeoples = new ArrayList<>();

    // Calculated averages
    private Double avgPriceMonth;
    private Double avgArea;
    private Double avgRoomLength;
    private Double avgRoomWidth;
    private Double avgElecPrice;
    private Double avgWaterPrice;
    private Integer avgMaxPeople;

    private Address userAddress;

    /**
     * Add room data to the preference profile
     */
    public void addRoomData(Room room) {
        if (room.getPrice_month() != null)
            priceMonths.add(room.getPrice_month());
        if (room.getArea() != null)
            areas.add(room.getArea());
        if (room.getRoomLength() != null)
            roomLengths.add(room.getRoomLength());
        if (room.getRoomWidth() != null)
            roomWidths.add(room.getRoomWidth());
        if (room.getElecPrice() != null)
            elecPrices.add(room.getElecPrice());
        if (room.getWaterPrice() != null)
            waterPrices.add(room.getWaterPrice());
        if (room.getMaxPeople() != null)
            maxPeoples.add(room.getMaxPeople());
    }

    /**
     * Calculate average values from collected data
     */
    public void calculateAverages() {
        avgPriceMonth = priceMonths.isEmpty() ? null
                : priceMonths.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        avgArea = areas.isEmpty() ? null : areas.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        avgRoomLength = roomLengths.isEmpty() ? null
                : roomLengths.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        avgRoomWidth = roomWidths.isEmpty() ? null
                : roomWidths.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        avgElecPrice = elecPrices.isEmpty() ? null
                : elecPrices.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        avgWaterPrice = waterPrices.isEmpty() ? null
                : waterPrices.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        avgMaxPeople = maxPeoples.isEmpty() ? null
                : (int) maxPeoples.stream().mapToInt(Integer::intValue).average().orElse(0);
    }

    /**
     * Check if profile has no data
     */
    public boolean isEmpty() {
        return priceMonths.isEmpty() && areas.isEmpty() && roomLengths.isEmpty() &&
                roomWidths.isEmpty() && elecPrices.isEmpty() && waterPrices.isEmpty() &&
                maxPeoples.isEmpty();
    }

    /**
     * Get total number of data points collected
     */
    public int getDataPointCount() {
        return priceMonths.size() + areas.size() + roomLengths.size() +
                roomWidths.size() + elecPrices.size() + waterPrices.size() + maxPeoples.size();
    }

}
