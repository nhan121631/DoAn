package com.ants.ktc.ants_ktc.repositories;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.repositories.projection.RoomApprovalProjection;
import com.ants.ktc.ants_ktc.repositories.projection.RoomByAdminPagingProjection;
import com.ants.ktc.ants_ktc.repositories.projection.RoomByLandlordPagingProjection;
import com.ants.ktc.ants_ktc.repositories.projection.RoomDeleteProjection;
import com.ants.ktc.ants_ktc.repositories.projection.RoomHiddenProjection;
import com.ants.ktc.ants_ktc.repositories.projection.RoomNewProjection;

@Repository
public interface RoomJpaRepository extends JpaRepository<Room, UUID> {
        @EntityGraph(attributePaths = { "images", "convenients", "postType" })
        @Override
        @org.springframework.lang.NonNull
        Optional<Room> findById(@org.springframework.lang.NonNull UUID id);

        // @EntityGraph(attributePaths = {
        // "user", "user.roles", "address", "address.ward", "address.ward.district",
        // "address.ward.district.province"
        // })
        @EntityGraph(attributePaths = {
                        "postType",
                        // "images", // chỉ nên fetch 1 List nếu không muốn lỗi
                        // MultipleBagFetchException
                        "convenients",
                        "address",
                        "address.ward",
                        "address.ward.district",
                        "address.ward.district.province",
        })
        Optional<Room> findDetailedById(UUID id);

        @Query("SELECT r FROM Room r WHERE r.user.id = :userId")
        List<Room> findAllByUser(UUID userId);

        // @Query get all rooms for landlord with pagination
        @Query("SELECT r FROM Room r " +
                        "JOIN FETCH r.postType pt " +
                        "LEFT JOIN FETCH r.address a " +
                        "LEFT JOIN FETCH a.ward w " +
                        "LEFT JOIN FETCH w.district d " +
                        "LEFT JOIN FETCH d.province pr " +
                        "WHERE r.user.id = :userId")
        Page<RoomByLandlordPagingProjection> findAllByLandlord(@Param("userId") UUID userId, Pageable pageable);

        // @Query get all rooms for admin with pagination
        @Query("SELECT r FROM Room r " +
                        "JOIN FETCH r.user u " +
                        "JOIN FETCH r.postType pt " +
                        "LEFT JOIN FETCH r.address a " +
                        "LEFT JOIN FETCH a.ward w " +
                        "LEFT JOIN FETCH w.district d " +
                        "LEFT JOIN FETCH d.province pr "
        // +"WHERE r.isRemoved = 0"
        )
        Page<RoomByAdminPagingProjection> findAllByAdmin(Pageable pageable);

        // Fetch room details for extend functionality
        @Query("SELECT r FROM Room r JOIN FETCH r.user u JOIN FETCH u.wallet w JOIN FETCH r.postType pt WHERE r.id = :roomId")
        Optional<Room> findForExtendById(@Param("roomId") UUID roomId);

        // Projection for room approval status
        @Query("SELECT r.id AS id, r.approval AS approval, r.title AS title, r.user AS user FROM Room r WHERE r.id = :roomId")
        Optional<RoomApprovalProjection> findApprovalProjectionById(@Param("roomId") UUID roomId);

        @Modifying
        @Query("UPDATE Room r SET r.approval = :approval WHERE r.id = :roomId")
        void updateApprovalById(@Param("roomId") UUID roomId, @Param("approval") int approval);

        // Projection for room hidden status
        @Query("SELECT r.id AS id, r.hidden AS hidden FROM Room r WHERE r.id = :roomId")
        Optional<RoomHiddenProjection> findHiddenProjectionById(@Param("roomId") UUID roomId);

        @Modifying
        @Query("UPDATE Room r SET r.hidden = :hidden WHERE r.id = :roomId")
        void updateHiddenById(@Param("roomId") UUID roomId, @Param("hidden") int hidden);

        // Projection for room delete status
        @Query("SELECT r.id AS id, r.isRemoved AS isRemoved FROM Room r WHERE r.id = :roomId")
        Optional<RoomDeleteProjection> findDeleteProjectionById(@Param("roomId") UUID roomId);

        @Modifying
        @Query("UPDATE Room r SET r.isRemoved = :isRemoved WHERE r.id = :roomId")
        void updateIsRemovedById(@Param("roomId") UUID roomId, @Param("isRemoved") int isRemoved);

        @Query("SELECT r FROM Room r " +
                        "JOIN FETCH r.user u " +
                        "JOIN FETCH r.postType pt " +
                        "LEFT JOIN FETCH r.address a " +
                        "LEFT JOIN FETCH a.ward w " +
                        "LEFT JOIN FETCH w.district d " +
                        "LEFT JOIN FETCH d.province pr " +
                        "WHERE r.user.id = :userId")
        Page<Room> findAllByUser(@Param("userId") UUID userId, Pageable pageable);

        // List<RoomNameProjection> findByUserIdAndIsRemovedFalse(UUID userId);

        // Optional<Room> findByIdAndUserIdAndIsRemovedFalse(UUID id, UUID userId);
        @Query("SELECT r FROM Room r WHERE r.user.id = :userId AND r.isRemoved = 0")
        List<RoomNameProjection> findActiveRoomsByUserId(@Param("userId") UUID userId);

        @Query("SELECT r FROM Room r WHERE r.id = :id AND r.user.id = :userId AND r.isRemoved = 0")
        Optional<Room> findActiveRoomByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

        @Query("SELECT r FROM Room r " +
                        "JOIN FETCH r.user u " +
                        "JOIN FETCH u.profile up " +
                        "JOIN FETCH r.postType p " +
                        "LEFT JOIN FETCH r.address a " +
                        "LEFT JOIN FETCH a.ward w " +
                        "LEFT JOIN FETCH w.district d " +
                        "LEFT JOIN FETCH d.province pr " +
                        "WHERE r.available = 0 AND p.code LIKE :code " +
                        "AND r.post_end_date > CURRENT_DATE " +
                        "AND r.hidden = 0 AND r.isRemoved = 0 AND r.approval = 1")
        Page<Room> findAllRoomInUser(@Param("code") String code, Pageable pageable);

        @Query(" SELECT COUNT(r) FROM Room r WHERE approval = 1 and isRemoved = 0")
        Long countAcceptedApprovalRooms();

        @Query(" SELECT COUNT(r) FROM Room r WHERE approval = 0 and isRemoved = 0")
        Long countPendingApprovalRooms();

        @Query(" SELECT COUNT(r) FROM Room r WHERE isRemoved = 0 and approval != 2")
        Long countTotalApprovalRooms();

        @EntityGraph(attributePaths = {
                        "address.ward.district.province",
                        "address.ward",
                        "address.ward.district",
                        "postType",
                        // "convenients",
                        "user",
                        "images"
        })
        @Query("SELECT r FROM Room r " +
                        "JOIN r.address a " +
                        "JOIN a.ward w " +
                        "JOIN w.district d " +
                        "JOIN d.province p " +
                        "WHERE r.available = 0 " +
                        "AND r.post_end_date > CURRENT_DATE " +
                        "AND r.hidden = 0 " +
                        "AND r.isRemoved = 0 " +
                        "AND r.approval = 1 " +
                        "AND (:minPrice IS NULL OR r.price_month >= :minPrice) " +
                        "AND (:maxPrice IS NULL OR r.price_month <= :maxPrice) " +
                        "AND (:minArea IS NULL OR r.area >= :minArea) " +
                        "AND (:maxArea IS NULL OR r.area <= :maxArea) " +
                        "AND (:provinceId IS NULL OR p.id = :provinceId) " +
                        "AND (:districtId IS NULL OR d.id = :districtId) " +
                        "AND (:wardId IS NULL OR w.id = :wardId) " +
                        "AND r.id IN (:roomIds)")
        Page<Room> findRoomsWithBasicFilterAndRoomIds(
                        @Param("minPrice") Double minPrice,
                        @Param("maxPrice") Double maxPrice,
                        @Param("minArea") Double minArea,
                        @Param("maxArea") Double maxArea,
                        @Param("provinceId") Long provinceId,
                        @Param("districtId") Long districtId,
                        @Param("wardId") Long wardId,
                        @Param("roomIds") List<UUID> roomIds,
                        Pageable pageable);

        @Query(value = "SELECT LOWER(HEX(rc.room_id)) FROM room_convenients rc " +
                        "WHERE rc.convenient_id IN (:convenientIds) " +
                        "GROUP BY rc.room_id " +
                        "HAVING COUNT(DISTINCT rc.convenient_id) = :requiredCount", nativeQuery = true)
        List<String> findRoomIdsByConvenientsHex(
                        @Param("convenientIds") List<Long> convenientIds,
                        @Param("requiredCount") int requiredCount);

        @Query("SELECT r FROM Room r " +
                        "JOIN r.address a " +
                        "JOIN a.ward w " +
                        "JOIN w.district d " +
                        "JOIN d.province p " +
                        "WHERE r.available = 0 " +
                        "AND r.post_end_date > CURRENT_DATE " +
                        "AND r.hidden = 0 " +
                        "AND r.isRemoved = 0 " +
                        "AND r.approval = 1 " +
                        "AND (:minPrice IS NULL OR r.price_month >= :minPrice) " +
                        "AND (:maxPrice IS NULL OR r.price_month <= :maxPrice) " +
                        "AND (:minArea IS NULL OR r.area >= :minArea) " +
                        "AND (:maxArea IS NULL OR r.area <= :maxArea) " +
                        "AND (:provinceId IS NULL OR p.id = :provinceId) " +
                        "AND (:districtId IS NULL OR d.id = :districtId) " +
                        "AND (:wardId IS NULL OR w.id = :wardId)")
        Page<Room> findRoomsWithBasicFilter(
                        @Param("minPrice") Double minPrice,
                        @Param("maxPrice") Double maxPrice,
                        @Param("minArea") Double minArea,
                        @Param("maxArea") Double maxArea,
                        @Param("provinceId") Long provinceId,
                        @Param("districtId") Long districtId,
                        @Param("wardId") Long wardId,
                        Pageable pageable);

@Query(value = "SELECT LOWER(HEX(r.id)) AS id, r.title AS title, r.price_month AS priceMonth, r.post_start_date AS postStartDate, " +
               "(SELECT i.url FROM images i WHERE i.room_id = r.id ORDER BY i.id ASC LIMIT 1) AS imageUrl " +
               "FROM rooms r " +
               "WHERE r.available = 0 " +
               "AND r.post_end_date > CURRENT_DATE " +
               "AND r.hidden = 0 " +
               "AND r.is_removed = 0 " +
               "AND r.approval = 1 " +
               "AND r.post_start_date >= :limitday",
       nativeQuery = true)
List<RoomNewProjection> findRecentRooms(@Param("limitday") Date limitday, Pageable pageable);

}
