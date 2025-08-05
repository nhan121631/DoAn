package com.ants.ktc.ants_ktc.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "maintenances")
@Data
@EqualsAndHashCode(callSuper = true)
public class Maintenances extends BaseEntity {
    @Column(name = "problem", nullable = false, length = 255)
    private String problem;

    @Column(name = "cost", nullable = false)
    private Double cost;

    @Column(name = "status", nullable = false)
    private int status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;
    private boolean isRemoved = false;
}
