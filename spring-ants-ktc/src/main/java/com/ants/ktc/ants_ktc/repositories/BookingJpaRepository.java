package com.ants.ktc.ants_ktc.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.Booking;
import com.ants.ktc.ants_ktc.repositories.projection.BookingUserProjection;
import com.ants.ktc.ants_ktc.repositories.projection.BookingLandlordProjection;

@Repository
public interface BookingJpaRepository extends JpaRepository<Booking, UUID> {

        // Kiểm tra user đã đặt phòng này chưa
        // boolean existsByUserIdAndRoomId(UUID userId, UUID roomId);
        boolean existsByUserIdAndRoomIdAndIsRemoved(UUID userId, UUID roomId, int isRemoved);

        // Lấy danh sách booking theo user
        @Query("SELECT b FROM Booking b " +
                        "JOIN FETCH b.room r " +
                        "JOIN FETCH r.address a " +
                        "JOIN FETCH a.ward w " +
                        "JOIN FETCH w.district d " +
                        "JOIN FETCH d.province p " +
                        "JOIN FETCH r.user ru " +
                        "JOIN FETCH ru.profile rup " +
                        "WHERE b.user.id = :userId")
        List<Booking> findByUserIdWithDetails(@Param("userId") UUID userId);

        // Lấy booking theo ID với tất cả thông tin cần thiết
        @Query("SELECT b FROM Booking b " +
                        "JOIN FETCH b.room r " +
                        "JOIN FETCH r.address a " +
                        "JOIN FETCH a.ward w " +
                        "JOIN FETCH w.district d " +
                        "JOIN FETCH d.province p " +
                        "JOIN FETCH r.user ru " +
                        "JOIN FETCH ru.profile rup " +
                        "JOIN FETCH b.user u " +
                        "JOIN FETCH u.profile up " +
                        "WHERE b.id = :bookingId")
        Booking findByIdWithDetails(@Param("bookingId") UUID bookingId);

        // Lấy booking theo ID chỉ với thông tin cần thiết cho updateBookingStatus
        @Query("SELECT b FROM Booking b " +
                        "JOIN FETCH b.room r " +
                        "JOIN FETCH r.user ru " +
                        "JOIN FETCH b.user u " +
                        "WHERE b.id = :bookingId")
        Booking findByIdForStatusUpdate(@Param("bookingId") UUID bookingId);

        // Lấy danh sách booking theo user sử dụng projection
        @Query("SELECT b FROM Booking b " +
                        "JOIN FETCH b.room r " +
                        "JOIN FETCH r.address a " +
                        "JOIN FETCH a.ward w " +
                        "JOIN FETCH w.district d " +
                        "JOIN FETCH d.province p " +
                        "JOIN FETCH r.user ru " +
                        "JOIN FETCH ru.profile rup " +
                        "WHERE b.user.id = :userId")
        Page<BookingUserProjection> findByUserIdProjection(@Param("userId") UUID userId, Pageable pageable);

        // Lấy danh sách booking theo landlord sử dụng projection
        @Query("SELECT b FROM Booking b " +
                        "JOIN FETCH b.room r " +
                        "JOIN FETCH r.address a " +
                        "JOIN FETCH a.ward w " +
                        "JOIN FETCH w.district d " +
                        "JOIN FETCH d.province p " +
                        "JOIN FETCH b.user u " +
                        "JOIN FETCH u.profile up " +
                        "WHERE r.user.id = :landlordId")
        Page<BookingLandlordProjection> findByLandlordIdProjection(@Param("landlordId") UUID landlordId,
                        Pageable pageable);

        // Lấy userId và landlordId (room.user.id) cho 1 booking, tối ưu cho xóa nhanh
        // Use LEFT JOINs so the query returns a row even if booking.user or room.user
        // is null
        @Query("SELECT u.id, ru.id FROM Booking b LEFT JOIN b.user u LEFT JOIN b.room r LEFT JOIN r.user ru WHERE b.id = :bookingId")
        java.util.List<Object[]> findBookingUserAndLandlordIds(@Param("bookingId") UUID bookingId);

        // Update nhanh trường isRemoved cho 1 booking
        @Modifying(clearAutomatically = true)
        @Query("UPDATE Booking b SET b.isRemoved = :isRemoved WHERE b.id = :bookingId")
        int updateIsRemovedById(@Param("bookingId") UUID bookingId, @Param("isRemoved") int isRemoved);

        // Lấy tất cả booking đang hoạt động (status = 4) để kiểm tra availability
        @Query("SELECT b FROM Booking b " +
                        "JOIN FETCH b.room r " +
                        "WHERE b.status = 4 AND b.isRemoved = 0")
        List<Booking> findActiveBookingsForAvailabilityCheck();

        @Modifying(clearAutomatically = true)
        @Query("UPDATE Booking b SET b.status = :newStatus WHERE b.room.id = :roomId AND b.status = :oldStatus AND b.id <> :bookingId")
        int updateStatusByRoomIdAndOldStatusExcludeBookingId(@Param("roomId") UUID roomId,
                        @Param("oldStatus") int oldStatus, @Param("newStatus") int newStatus,
                        @Param("bookingId") UUID bookingId);

        // Lấy danh sách booking theo user
        // @Query(value = "SELECT b FROM Booking b " +
        // "JOIN FETCH b.room r " +
        // "JOIN FETCH r.address a " +
        // "JOIN FETCH a.ward w " +
        // "JOIN FETCH w.district d " +
        // "JOIN FETCH d.province p " +
        // "JOIN FETCH r.user ru " +
        // "JOIN FETCH ru.profile rup " +
        // "WHERE b.user.id = :userId", countQuery = "SELECT COUNT(b) FROM Booking b
        // WHERE b.user.id = :userId")
        // Page<Booking> findByUserIdWithDetails(@Param("userId") UUID userId, Pageable
        // pageable);

        // // Lấy danh sách booking theo landlord
        // @Query(value = "SELECT b FROM Booking b " +
        // "JOIN FETCH b.room r " +
        // "JOIN FETCH r.address a " +
        // "JOIN FETCH a.ward w " +
        // "JOIN FETCH w.district d " +
        // "JOIN FETCH d.province p " +
        // "JOIN FETCH b.user u " +
        // "JOIN FETCH u.profile up " +
        // "WHERE r.user.id = :landlordId", countQuery = "SELECT COUNT(b) FROM Booking b
        // WHERE b.room.user.id = :landlordId")
        // Page<Booking> findByRoomUserIdWithDetails(@Param("landlordId") UUID
        // landlordId, Pageable pageable);

        // Statistics queries
        @Query("SELECT COUNT(b) FROM Booking b WHERE b.createdDate >= :startDate")
        Long countByCreatedDateAfter(@Param("startDate") java.util.Date startDate);

}
