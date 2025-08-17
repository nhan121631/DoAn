package com.ants.ktc.ants_ktc.repositories.projection;

import java.sql.Date;

public interface LandLordProjectionByRoom {
    String getId();

    String getFullName();

    String getEmail();

    String getAvatar();

    String getPhone();

    Date getCreateDate();
}
