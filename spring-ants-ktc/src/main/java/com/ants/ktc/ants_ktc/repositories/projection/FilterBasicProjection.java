package com.ants.ktc.ants_ktc.repositories.projection;

import java.util.Date;

public interface FilterBasicProjection {

    String getId();

    String getTitle();

    String getDescription();

    Double getPriceMonth();

    Double getArea();

    Integer getMaxPeople();

    Date getPostStartDate();

    // Address fields (flat)
    String getAddressId();

    String getStreet();

    // Ward fields
    Integer getWardId();

    String getWardName();

    // District fields
    Integer getDistrictId();

    String getDistrictName();

    // Province fields
    Integer getProvinceId();

    String getProvinceName();

    // Landlord fields
    String getLandlordId();

    String getLandlordProfileId();

    String getFullName();

    String getEmail();

    String getPhoneNumber();

    String getAvatar();

    // Aggregated fields
    Integer getFavoriteCount();

    Integer getViewCount();

    // Single image URL (first image)
    String getFirstImageUrl();

    // Single image ID (first image)
    Long getFirstImageId();

    // Conveniences as concatenated string (format: "id1:name1|id2:name2")
    String getConvenienceString();
}
