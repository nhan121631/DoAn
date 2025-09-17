package com.ants.ktc.ants_ktc.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "requirements")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Requirement extends BaseEntity {
    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "status", nullable = false)
    private int status;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "image_public_id")
    private String imagePublicId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Requirement(String description, int status, Room room, User user) {
        this.description = description;
        this.status = status;
        this.room = room;
        this.user = user;
    }
}