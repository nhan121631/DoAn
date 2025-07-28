package com.ants.ktc.ants_ktc.entities;

import java.util.Date;

import org.hibernate.annotations.ManyToAny;

import jakarta.persistence.Entity;
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
    private int status; // 0: pending, 1: chờ cọc, 2: reject, 3: chờ xác nhận cọc, 4: đã cọc, 5:đã hủy

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Rooms room;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users user;

}