package com.ants.ktc.ants_ktc.repositories.room_mock;

import com.ants.ktc.ants_ktc.entities.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional; // Để trả về Optional khi tìm kiếm một đối tượng
import java.util.UUID; // Để sử dụng cho ID kiểu UUID

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {
    // Phương thức để tìm một Room theo ID của nó và ID của Landlord sở hữu (User
    // ID)
    // isRemoveFalse nếu bạn có trường is_remove để soft delete
    Optional<Room> findByIdAndUser_IdAndIsRemoveFalse(UUID roomId, UUID userId);
    // Lưu ý: User_Id ở đây ánh xạ tới User.id trong entity Room (private User
    // user;)
    // Hoặc nếu bạn muốn chính xác hơn với tên thuộc tính:
    // Optional<Room> findByIdAndLandlordId(UUID roomId, Integer landlordId);
    // (nếu bạn đã tạo thuộc tính landlordId trong Room Entity trỏ đến user ID)

    // Bạn cũng có thể cần các phương thức khác tùy thuộc vào yêu cầu của bạn của
    // bạn cho API Room.
    @org.springframework.data.jpa.repository.Query("SELECT r FROM Room r " +
            "LEFT JOIN FETCH r.address ra " +
            "LEFT JOIN FETCH ra.ward waw " +
            "LEFT JOIN FETCH waw.district wad " +
            "LEFT JOIN FETCH wad.province wap " +
            "WHERE r.user.id = :userId AND r.isRemove = FALSE")
    List<Room> findAllByUser_IdAndIsRemoveFalse(@org.springframework.data.repository.query.Param("userId") UUID userId);
}