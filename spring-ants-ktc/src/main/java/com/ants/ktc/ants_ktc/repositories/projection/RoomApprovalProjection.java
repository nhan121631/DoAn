package com.ants.ktc.ants_ktc.repositories.projection;

import java.util.UUID;

import com.ants.ktc.ants_ktc.entities.User;

public interface RoomApprovalProjection {

    UUID getId();
    int getApproval();
    String getTitle();
    User getUser();
}
