package com.ants.ktc.ants_ktc.repositories.projection;

import java.time.LocalDateTime;

public interface RequirementLandLordProjection {
    String getId();

    String getUserId();

    String getRoomId();

    String getRoomTitle();

    String getUserName();

    String getEmail();

    String getDescription();

    int getStatus();

    String getImageUrl();

    LocalDateTime getCreatedDate();
}