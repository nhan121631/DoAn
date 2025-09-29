package com.ants.ktc.ants_ktc.entities;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "bookings")
@Data
@EqualsAndHashCode(callSuper = true)
public class Booking extends BaseEntity {

    private Date rentalDate;
    private Date rentalExpires;
    private int tenantCount;
    private int status; // 0: pending, 1: accepted, 2: rejected, 3: waiting for deposit, 4: deposited
    private int isRemoved = 0; // 0: not removed, 1: removed

    private String imageProof;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

}