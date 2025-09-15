package com.ants.ktc.ants_ktc.dtos.favorite;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

// import java.util.UUID;
// import lombok.AllArgsConstructor;
// import lombok.Data;
// import lombok.NoArgsConstructor;

// @Data
// @NoArgsConstructor
// @AllArgsConstructor
// public class FavoriteRoomProjection {
//     private UUID id;
//     private String title;
//     private Double priceMonth;
//     private Double area;
//     private String address;
// }

import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.ants.ktc.ants_ktc.dtos.address.AddressResponseDto;
import com.ants.ktc.ants_ktc.dtos.convenient.ConvenientResponseDto;
import com.ants.ktc.ants_ktc.dtos.image.ImageResponseDto;
import com.ants.ktc.ants_ktc.dtos.user.LandlordResponseDto;

@AllArgsConstructor
@Builder
@Data
@NoArgsConstructor
public class FavoriteRoomProjection {
    private UUID id;
    private String title;
    private String description;
    private Double priceMonth;
    private Double area;
    private Date postStartDate;
    private AddressResponseDto address;
    private List<ImageResponseDto> images;
    private List<ConvenientResponseDto> conveniences;
    private LandlordResponseDto landlord;
    private long favoriteCount;
    // thêm
    private String postType;

    public Boolean getIsVip() {
        return "Post VIP".equals(postType);
    }
}
