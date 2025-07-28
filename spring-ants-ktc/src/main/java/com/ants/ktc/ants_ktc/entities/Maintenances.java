package com.ants.ktc.ants_ktc.entities;

import jakarta.persistence.Entity;
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
    private String problem;
    private Double cost;
    private int status;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Rooms room;
}
