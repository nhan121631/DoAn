package com.ants.ktc.ants_ktc.entities;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.ants.ktc.ants_ktc.entities.address.Address;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "rooms")
@Data
@EqualsAndHashCode(callSuper = true)
public class Rooms extends BaseEntity {
    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "price_month", nullable = false)
    private Double price_month;

    @Column(name = "price_deposit")
    private Double price_deposit;

    @Column(name = "available", nullable = false)
    private int available;

    @Column(name = "approval", nullable = false)
    private int approval;

    @Column(name = "hidden", nullable = false)
    private int hidden;

    @Column(name = "post_start_date")
    private Date post_start_date;

    @Column(name = "post_end_date")
    private Date post_end_date;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Images> images = new ArrayList<>();

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Maintenances> maintenances = new ArrayList<>();

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Requirements> requirements = new ArrayList<>();

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Booking> bookings = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "post_type_id", nullable = false)
    private PostType postType;

    @ManyToOne
    @JoinColumn(name = "address_id", nullable = false)
    private Address address;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;
}
