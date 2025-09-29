package com.ants.ktc.ants_ktc.repositories.projection;

import java.util.Date;
import java.util.UUID;

public interface BookingLandlordProjection {
    UUID getId();

    Date getRentalDate();

    Date getRentalExpires();

    Integer getTenantCount();

    Integer getStatus();

    Integer getIsRemoved();

    String getImageProof();

    // Room projection for landlord
    BookingRoomLandlordProjection getRoom();

    // User (tenant) projection
    BookingTenantProjection getUser();

    interface BookingRoomLandlordProjection {
        UUID getId();

        String getTitle();

        Double getPrice_month();

        Double getPrice_deposit();

        Integer getAvailable();

        Double getArea();

        // Address projection
        BookingAddressProjection getAddress();
    }

    interface BookingTenantProjection {
        UUID getId();

        BookingTenantProfileProjection getProfile();
    }

    interface BookingTenantProfileProjection {
        String getFullName();

        String getPhoneNumber();
    }

    interface BookingAddressProjection {
        UUID getId();

        String getStreet();

        BookingWardProjection getWard();
    }

    interface BookingWardProjection {
        Long getId();

        String getName();

        BookingDistrictProjection getDistrict();
    }

    interface BookingDistrictProjection {
        Long getId();

        String getName();

        BookingProvinceProjection getProvince();
    }

    interface BookingProvinceProjection {
        Long getId();

        String getName();
    }
}
