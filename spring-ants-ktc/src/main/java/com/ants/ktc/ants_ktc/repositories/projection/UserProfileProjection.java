package com.ants.ktc.ants_ktc.repositories.projection;

import java.util.UUID;

public interface UserProfileProjection {
    UUID getId();
    String getFullName();
    String getAvatar();
}
