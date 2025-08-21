package com.ants.ktc.ants_ktc.repositories.projection;

import java.util.UUID;

public interface RoomSuggestionProjection {
    UUID getId();

    String getTitle();

    Double getArea();

    Double getPriceMonth();

    String getPostType();

    String getFullAddress();

    Double getLng();

    Double getLat();

    // formatching
    Double getDistance();

    String getDescription();

    //information landlord name email phone
    String getLandlordName();
    String getLandlordEmail();
    String getLandlordPhone();
}
