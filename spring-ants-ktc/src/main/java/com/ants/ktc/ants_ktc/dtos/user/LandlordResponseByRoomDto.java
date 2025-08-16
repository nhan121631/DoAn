package com.ants.ktc.ants_ktc.dtos.user;

import java.sql.Date;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LandlordResponseByRoomDto {
    private UUID id;

    private String fullName;

    private String email;

    private String avatar;

    private int amountPost;

    private String phone;

    private Date createDate;
}
