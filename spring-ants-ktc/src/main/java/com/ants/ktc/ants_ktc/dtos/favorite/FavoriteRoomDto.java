// package com.ants.ktc.ants_ktc.dtos.favorite;

// import com.ants.ktc.ants_ktc.entities.Room;
// import lombok.Data;
// import java.util.UUID;

// @Data
// public class FavoriteRoomDto {
// private UUID id;
// private String title;
// private Double priceMonth;
// private Double area;
// private String address;

// // Constructor để tạo DTO từ Room Entity (cũ)
// public FavoriteRoomDto(Room room) {
// this.id = room.getId();
// this.title = room.getTitle();
// this.priceMonth = room.getPrice_month();
// this.area = room.getArea();
// this.address = (room.getAddress() != null) ?
// String.valueOf(room.getAddress()) : null;
// }

// // Constructor mới để khắc phục lỗi bạn gặp phải
// public FavoriteRoomDto(UUID id, String title, Double priceMonth, Double area,
// String address) {
// this.id = id;
// this.title = title;
// this.priceMonth = priceMonth;
// this.area = area;
// this.address = address;
// }
// }