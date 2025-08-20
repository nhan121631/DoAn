package com.ants.ktc.ants_ktc.repositories.projection;

import java.util.UUID;

public interface RoomMapProjection {
    UUID getId();

    String getTitle();

    String getImageUrl();

    Double getArea();

    Double getPriceMonth();

    String getPostType();

    String getFullAddress();

    Double getLng();

    Double getLat();

}
