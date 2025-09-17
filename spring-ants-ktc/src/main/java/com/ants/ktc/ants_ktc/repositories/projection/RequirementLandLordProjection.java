package com.ants.ktc.ants_ktc.repositories.projection;

import java.time.LocalDateTime;

public interface RequirementLandLordProjection {
    String getId();

    String getRoomTitle();

    String getUserName();

    String getEmail();

    String getDescription();

    int getStatus();

    String getImageUrl();

    LocalDateTime getCreatedDate();
}