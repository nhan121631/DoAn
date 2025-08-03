package com.ants.ktc.ants_ktc.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // Lombok: getters, setters, toString, equals, hashCode
@NoArgsConstructor // Lombok: constructor không đối số
@AllArgsConstructor // Lombok: constructor với tất cả các trường
public class UpdateUserStatusRequestDto {
    private int status; // 0 = Active, 1 = Disabled
}