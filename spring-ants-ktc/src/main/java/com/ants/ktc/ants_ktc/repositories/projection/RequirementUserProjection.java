package com.ants.ktc.ants_ktc.repositories.projection;

import java.time.LocalDateTime;

public interface RequirementUserProjection {
    String getId();

    String getRoomTitle();

    String getUserId();

    String getRoomId();

    String getUserName();

    String getEmail();

    String getDescription();

    int getStatus();

    String getImageUrl();

    LocalDateTime getCreatedDate();
}
