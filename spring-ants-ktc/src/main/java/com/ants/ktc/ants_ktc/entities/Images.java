package com.ants.ktc.ants_ktc.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "images")
@Data
@EqualsAndHashCode(callSuper = true)
public class Images extends BaseEntity {
    private String url;
    @ManyToOne
    @JoinColumn(name = "room_id")
    private Rooms room;
}
