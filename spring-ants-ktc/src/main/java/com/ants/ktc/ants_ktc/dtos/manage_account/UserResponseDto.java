package com.ants.ktc.ants_ktc.dtos.manage_account;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor; // Thêm import này
import lombok.AllArgsConstructor; // Thêm import này
import java.util.UUID;
import java.util.List; // Thêm import này

@Data // Tự động tạo getters, setters, toString, equals, hashCode
@Builder // Tự động tạo builder pattern
@NoArgsConstructor // Tự động tạo constructor không đối số
@AllArgsConstructor // Tự động tạo constructor với tất cả các trường (cần cho builder hoạt động đúng
                    // cách)
public class UserResponseDto {
    private UUID id; // ID của User
    private String username;
    private String email; // Từ UserProfile
    private String phoneNumber; // Từ UserProfile
    private String status; // Chuyển đổi từ isActive (0/1) sang "Active" hoặc "Disabled"
    private List<String> roles; // Danh sách các quyền hạn (e.g., "USER", "LANDLORD", "ADMINISTRATOR")

    // Không cần constructor mặc định và constructor có đối số thủ công nữa
    // Lombok @NoArgsConstructor và @AllArgsConstructor (kết hợp với @Builder) sẽ xử
    // lý.
    // Lưu ý: @AllArgsConstructor là cần thiết để @Builder có thể biết cách khởi tạo
    // tất cả các trường.
}