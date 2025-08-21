package com.ants.ktc.ants_ktc.repositories.projection;

public interface RoomMapProjection {
    String getId();

    String getTitle();

    String getImageUrl();

    Double getArea();

    Double getPriceMonth();

    String getPostType();

    String getFullAddress();

    Double getLng();

    Double getLat();
}
