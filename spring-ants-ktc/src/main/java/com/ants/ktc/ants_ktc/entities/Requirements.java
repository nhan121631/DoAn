package com.ants.ktc.ants_ktc.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "requirements")
@Data
@EqualsAndHashCode(callSuper = true)
public class Requirements extends BaseEntity {
    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "status", nullable = false)
    private int status;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Rooms room;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;
}
