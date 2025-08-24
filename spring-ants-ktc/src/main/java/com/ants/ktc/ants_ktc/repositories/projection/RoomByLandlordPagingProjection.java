package com.ants.ktc.ants_ktc.repositories.projection;

import java.util.Date;
// import java.util.List;
import java.util.UUID;

public interface RoomByLandlordPagingProjection {
    UUID getId();

    String getTitle();

    String getDescription();

    Double getPrice_month();

    Double getPrice_deposit();

    int getAvailable();

    int getApproval();

    int getHidden();

    int getIsRemoved();

    Double getArea();

    Double getElecPrice();

    Double getWaterPrice();
    Double getRoomLength();
    Double getRoomWidth();
    Integer getMaxPeople();

    Date getPost_start_date();

    Date getPost_end_date();

    AddressInfo getAddress();

    // List<ImageInfo> getImages();

    // List<ConvenientInfo> getConvenients();

    interface PostTypeInfo {
        String getName();
    }

    PostTypeInfo getPostType();

    // UUID getUserId();

    interface AddressInfo {
        UUID getId();

        String getStreet();

        WardInfo getWard();

        interface WardInfo {
            Long getId();

            String getName();

            DistrictInfo getDistrict();

            interface DistrictInfo {
                Long getId();

                String getName();

                ProvinceInfo getProvince();

                interface ProvinceInfo {
                    Long getId();

                    String getName();
                }
            }
        }
    }

    // interface ImageInfo {
    // Long getId();

    // String getUrl();
    // }

    // interface ConvenientInfo {
    // Integer getId();

    // String getName();
    // }
}
