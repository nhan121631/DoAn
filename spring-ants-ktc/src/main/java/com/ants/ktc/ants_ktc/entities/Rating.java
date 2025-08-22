package com.ants.ktc.ants_ktc.entities;

import com.ants.ktc.ants_ktc.enums.FeedbackStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Entity
@Table(name = "ratings")
@Data
@EqualsAndHashCode(callSuper = true)
public class Rating extends BaseEntity {
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "score", nullable = false)
    private Integer score;

    @Column(name = "comment", length = 500)
    private String comment;

    @Column(name = "reply", length = 500)
    private String reply;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private FeedbackStatus status = FeedbackStatus.NEW;

    @Column(name = "date_rated", nullable = false, length = 20)
    private LocalDateTime dateRated;

}
