package com.ants.ktc.ants_ktc.dtos.booking;

import java.util.Date;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRoomRequestDto {
    private UUID roomId;
    private Date rentalDate;
    private Date rentalExpires;
    private int tenantCount;
}
