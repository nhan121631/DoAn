package com.ants.ktc.ants_ktc.entities;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.ants.ktc.ants_ktc.entities.address.Address;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "rooms")
@Data
@ToString(exclude = { "address", "user", "images", "maintenances", "requirements", "bookings", "convenients" })
@EqualsAndHashCode(callSuper = true)
public class Room extends BaseEntity {
    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "price_month", nullable = false)
    private Double price_month;

    @Column(name = "price_deposit", nullable = false)
    private Double price_deposit;

    @Column(name = "available", nullable = false)
    private int available = 0;

    @Column(name = "area", nullable = false)
    private Double area;

    @Column(name = "length", nullable = true)
    private Double roomLength;

    @Column(name = "width", nullable = true)
    private Double roomWidth;

    @Column(name = "elec_price")
    private Double elecPrice;

    @Column(name = "water_price")
    private Double waterPrice;

    @Column(name = "max_people")
    private Integer maxPeople;

    @Column(name = "approval", nullable = false)
    private int approval = 0;

    @Column(name = "hidden", nullable = false)
    private int hidden = 0;

    @Column(name = "is_removed", nullable = false)
    private int isRemoved = 0;

    @Column(name = "post_start_date")
    private Date post_start_date;

    @Column(name = "post_end_date")
    private Date post_end_date;

    @OneToMany(mappedBy = "room", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Image> images = new ArrayList<>();

    @OneToMany(mappedBy = "room", fetch = FetchType.LAZY)
    private List<Maintenances> maintenances = new ArrayList<>();

    @OneToMany(mappedBy = "room", fetch = FetchType.LAZY)
    private List<Requirement> requirements = new ArrayList<>();

    @OneToMany(mappedBy = "room", fetch = FetchType.LAZY)
    private List<Booking> bookings = new ArrayList<>();

    @ManyToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinTable(name = "room_convenients", joinColumns = @JoinColumn(name = "room_id"), inverseJoinColumns = @JoinColumn(name = "convenient_id"))
    private List<Convenient> convenients = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_type_id", nullable = false)
    private PostType postType;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id", referencedColumnName = "id")
    private Address address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public String getName() {
        return this.title;
    }

    private long viewCount;
}
