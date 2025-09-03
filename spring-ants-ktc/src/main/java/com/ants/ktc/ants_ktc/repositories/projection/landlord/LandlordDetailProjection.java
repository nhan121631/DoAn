package com.ants.ktc.ants_ktc.repositories.projection.landlord;

import java.time.LocalDateTime;

public interface LandlordDetailProjection {
    String getId();

    String getUsername();

    String getFullName();

    String getEmail();

    String getPhoneNumber();

    String getAvatar();

    LocalDateTime getMemberSince();

    Long getTotalListings();
}