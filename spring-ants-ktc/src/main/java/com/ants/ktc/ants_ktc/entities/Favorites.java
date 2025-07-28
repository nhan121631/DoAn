package com.ants.ktc.ants_ktc.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "favorites")
@Data
@EqualsAndHashCode(callSuper = true)
public class Favorites extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Rooms room;
}
