package com.ants.ktc.ants_ktc.repositories;

import java.util.Date;
import java.util.UUID;

public interface MaintenanceProjection {
    UUID getId();

    String getProblem();

    Double getCost();

    Integer getStatus();

    Date getCreatedDate();

    RoomInfoProjection getRoom();

    interface RoomInfoProjection {
        UUID getId();

        String getTitle();

    }
}