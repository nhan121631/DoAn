package com.ants.ktc.ants_ktc.repositories.projection;

import java.util.Date;

public interface RoomNewProjection {
    String getId();

    String getTitle();

    Double getPriceMonth();

    Date getPostStartDate();

    String getImageUrl();
}