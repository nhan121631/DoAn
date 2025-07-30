package com.ants.ktc.ants_ktc.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "ratings")
@Data
@EqualsAndHashCode(callSuper = true)
public class Ratings extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Rooms room;

    @Column(name = "score", nullable = false)
    private Integer score;

    @Column(name = "comment", length = 500)
    private String comment;

    @Column(name = "date_rated", nullable = false, length = 20)
    private String dateRated;

}
