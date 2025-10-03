package com.ants.ktc.ants_ktc.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@Table(name = "landlord_tasks")
@EqualsAndHashCode(callSuper = true)
public class LandlordTask extends BaseEntity {

    private String title;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime dueDate;
    private String status; // PENDING, IN_PROGRESS, COMPLETED, CANCELED
    private String priority; // LOW, MEDIUM, HIGH
    private String type; // REQUEST, BOOKING, RESIDENT, BILL, OTHER, MAINTENANCE
    private UUID relatedEntityId;

    @ManyToOne
    @JoinColumn(name = "landlord_id")
    private User landlord;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = true)
    private Room room;
}
