package com.ants.ktc.ants_ktc.dtos.room;

import java.util.List;
import java.util.UUID;

import org.hibernate.validator.constraints.Length;

import com.ants.ktc.ants_ktc.dtos.address.AddressCreateRequestDto;
import com.ants.ktc.ants_ktc.dtos.image.ImageCreateRequestDto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RoomRequestUpdateDto {
    @NotBlank(message = "Title is required.")
    @Length(max = 255, message = "Title must be at most 255 characters.")
    private String title;

    @Length(max = 2000, message = "Description must be at most 2000 characters.")
    private String description;
    @NotNull(message = "Monthly price is required.")
    @Positive(message = "Monthly price must be positive.")
    @Min(value = 0, message = "Monthly price must be at least 0.")
    private Double priceMonth;

    @NotNull(message = "Deposit price is required.")
    @PositiveOrZero(message = "Deposit price cannot be negative.")
    @Min(value = 0, message = "Deposit price must be at least 0.")
    private Double priceDeposit;
    // private Double area;
    @NotNull(message = "Room length is required.")
    @Positive(message = "Room length must be positive.")
    @Min(value = 0, message = "Room length must be at least 0.")
    private Double roomLength;

    @NotNull(message = "Room width is required.")
    @Positive(message = "Room width must be positive.")
    @Min(value = 0, message = "Room width must be at least 0.")
    private Double roomWidth;

    @NotNull(message = "Electricity price is required.")
    @PositiveOrZero(message = "Electricity price cannot be negative.")
    @Min(value = 0, message = "Electricity price must be at least 0.")
    private Double elecPrice;

    @NotNull(message = "Water price is required.")
    @PositiveOrZero(message = "Water price cannot be negative.")
    @Min(value = 0, message = "Water price must be at least 0.")
    private Double waterPrice;

    @NotNull(message = "Max people is required.")
    @Min(value = 1, message = "Max people must be at least 1.")
    private Integer maxPeople;
    private AddressCreateRequestDto address;
    // @NotNull(message = "UserId is required.")
    private UUID userId;
    private List<Long> convenientIds;
    private List<ImageCreateRequestDto> imageUrls;
    private List<String> existingImages; // URLs to keep

    public List<String> getExistingImages() {
        return existingImages;
    }

    public void setExistingImages(List<String> existingImages) {
        this.existingImages = existingImages;
    }
}
