package com.ants.ktc.ants_ktc.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.ants.ktc.ants_ktc.repositories.projection.UserProfileProjection;
import com.ants.ktc.ants_ktc.repositories.projection.landlord.LandlordDetailProjection;
import com.ants.ktc.ants_ktc.repositories.projection.landlord.LandlordProjectionCustom;
import com.ants.ktc.ants_ktc.repositories.projection.landlord.RoomProjectionForLandlord;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.repositories.projection.LandLordProjectionByRoom;

@Repository
public interface UserJpaRepository extends JpaRepository<User, UUID> {
    @Query("""
             SELECT u.id AS id, p.fullName AS fullName, p.avatar AS avatar
             FROM User u
             JOIN u.profile p
             WHERE u.id = :id
            """)
    Optional<UserProfileProjection> findFullNameById(@Param("id") UUID id);

    @Query("""
                SELECT u FROM User u
                LEFT JOIN FETCH u.profile p
                LEFT JOIN FETCH p.address a
                LEFT JOIN FETCH a.ward w
                LEFT JOIN FETCH w.district d
                LEFT JOIN FETCH d.province pr
                LEFT JOIN FETCH u.roles r
                WHERE u.username = :username
            """)
    Optional<User> findByUsername(@Param("username") String username);

    @Query("""
                SELECT u FROM User u
                LEFT JOIN FETCH u.profile p
                LEFT JOIN FETCH p.address a
                LEFT JOIN FETCH a.ward w
                LEFT JOIN FETCH w.district d
                LEFT JOIN FETCH d.province pr
                LEFT JOIN FETCH u.roles r
                WHERE u.username = :email
            """)
    User findByEmail(@Param("email") String email);

    @EntityGraph(attributePaths = {
            "profile",
            "profile.address",
            "profile.address.ward",
            "profile.address.ward.district",
            "profile.address.ward.district.province",
            "roles"
    })
    Page<User> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {
            "profile",
            "profile.address",
            "profile.address.ward",
            "profile.address.ward.district",
            "profile.address.ward.district.province",
            "roles"
    })
    Optional<User> findByProfileEmail(String email);

    boolean existsByUsername(String username);

    @Query(value = """
            SELECT DISTINCT u FROM User u
            LEFT JOIN FETCH u.profile p
            LEFT JOIN FETCH u.roles r
            WHERE r.name <> 'Administrators' OR r IS NULL
            """)
    List<User> findAllExcludingAdmins();

    @Query(value = """
            SELECT DISTINCT u FROM User u
            LEFT JOIN FETCH u.profile p
            LEFT JOIN FETCH u.roles r
            LEFT JOIN FETCH p.address a
            LEFT JOIN FETCH a.ward w
            LEFT JOIN FETCH w.district d
            LEFT JOIN FETCH d.province pr
            WHERE r.name <> 'Administrators' OR r IS NULL
            """, countQuery = "SELECT count(DISTINCT u) FROM User u LEFT JOIN u.roles r WHERE r.name <> 'Administrators' OR r IS NULL")
    Page<User> findAllExcludingAdmins(Pageable pageable);

    // @Query(value = """
    // SELECT COUNT(u) FROM User u WHERE u.isActive = 0
    // """)
    // Long countInactiveUsers();
    @Query("SELECT COUNT(u) FROM User u LEFT JOIN u.roles r WHERE u.isActive = 0 AND r.name <> 'Administrators'")
    Long countInactiveUsers();

    @EntityGraph(attributePaths = {
            "profile",
            "profile.address",
            "profile.address.ward",
            "profile.address.ward.district",
            "profile.address.ward.district.province",
            "roles"
    })
    @org.springframework.lang.NonNull
    Optional<User> findById(@org.springframework.lang.NonNull UUID userId);

    @Query("""
                SELECT p.fullName as fullName,
                       p.email as email,
                       p.phoneNumber as phone,
                       p.avatar as avatar,
                       u.id as id,
                       CAST(u.createdDate AS date) as createDate
                FROM User u
                LEFT JOIN u.profile p
                LEFT JOIN u.rooms r
                WHERE r.id = :roomId
                GROUP BY p.fullName, p.email, p.phoneNumber, p.avatar, u.createdDate
            """)
    Optional<LandLordProjectionByRoom> findLandlord(@Param("roomId") UUID roomId);

    @Query("""
                SELECT COUNT(r) FROM Room r WHERE r.user.id = :userId AND r.approval = 1
            """)
    int countRoomsByUserId(@Param("userId") UUID userId);

    // Lấy danh sách tất cả landlord

    @Query("""
                            SELECT
                            u.id as id,
            COALESCE(p.fullName, u.username) as fullName,
                            CASE
                                WHEN a.street IS NOT NULL OR w.name IS NOT NULL THEN
                                    CONCAT(
                                        COALESCE(a.street, ''),
                                        CASE WHEN a.street IS NOT NULL AND a.street != '' THEN ', ' ELSE '' END,
                                        COALESCE(w.name, ''),
                                        CASE WHEN w.name IS NOT NULL THEN ', ' ELSE '' END,
                                        COALESCE(d.name, ''),
                                        CASE WHEN d.name IS NOT NULL THEN ', ' ELSE '' END,
                                        COALESCE(pr.name, '')
                                    )
                                ELSE 'Chưa cập nhật địa chỉ'
                            END as address,
                            COALESCE(p.phoneNumber, '') as phoneNumber,
                            COALESCE(p.avatar, '') as avatar
                            FROM User u
                            LEFT JOIN u.profile p
                            LEFT JOIN p.address a
                            LEFT JOIN a.ward w
                            LEFT JOIN w.district d
                            LEFT JOIN d.province pr
                            LEFT JOIN u.roles r
                            WHERE r.code = 'LANDLORD'
                            ORDER BY u.createdDate DESC
                            """)
    Page<LandlordProjectionCustom> findAllLandlords(Pageable pageable);

    @Query("""
            SELECT
                u.id as id,
                u.username as username,
                COALESCE(p.fullName, u.username) as fullName,
                COALESCE(p.email, '') as email,
                COALESCE(p.phoneNumber, '') as phoneNumber,
                COALESCE(p.avatar, '') as avatar,
                u.createdDate as memberSince,
                (SELECT COUNT(r) FROM Room r
                 WHERE r.user.id = u.id
                 AND r.approval = 1
                 AND r.available = 0
                 AND r.post_end_date > CURRENT_DATE
                 AND r.hidden = 0
                 AND r.isRemoved = 0) as totalListings
            FROM User u
            LEFT JOIN u.profile p
            LEFT JOIN u.roles r
            WHERE u.id = :landlordId AND r.code = 'LANDLORD'
            """)
    Optional<LandlordDetailProjection> findLandlordById(@Param("landlordId") UUID landlordId);

    // API lấy bài đăng còn hạn của landlord

    @Query(value = """
            SELECT
                CONCAT(SUBSTR(LOWER(HEX(r.id)), 1, 8), '-', SUBSTR(LOWER(HEX(r.id)), 9, 4), '-', SUBSTR(LOWER(HEX(r.id)), 13, 4), '-', SUBSTR(LOWER(HEX(r.id)), 17, 4), '-', SUBSTR(LOWER(HEX(r.id)), 21, 12)) AS id,
                r.title as title,
                CONCAT(
                    COALESCE(a.name_street, ''),
                    CASE WHEN a.name_street IS NOT NULL AND a.name_street != '' THEN ', ' ELSE '' END,
                    COALESCE(w.name, ''),
                    CASE WHEN w.name IS NOT NULL THEN ', ' ELSE '' END,
                    COALESCE(d.name, ''),
                    CASE WHEN d.name IS NOT NULL THEN ', ' ELSE '' END,
                    COALESCE(pr.name, '')
                ) as address,
                r.price_month as price,
                r.area as area,
                (SELECT i.url FROM images i WHERE i.room_id = r.id ORDER BY i.id ASC LIMIT 1) as imageUrl,
                COALESCE((SELECT COUNT(f.id) FROM favorites f WHERE f.room_id = r.id), 0) as favoriteCount
            FROM rooms r
            LEFT JOIN addresses a ON r.address_id = a.id
            LEFT JOIN wards w ON a.ward_id = w.id
            LEFT JOIN districts d ON w.district_id = d.id
            LEFT JOIN provinces pr ON d.province_id = pr.id
            WHERE r.user_id = :landlordId
            AND r.available = 0
            AND r.post_end_date > CURRENT_DATE
            AND r.hidden = 0
            AND r.is_removed = 0
            AND r.approval = 1
            ORDER BY r.createddate DESC
            """, nativeQuery = true)
    Page<RoomProjectionForLandlord> findActiveRoomsByLandlord(@Param("landlordId") UUID landlordId,
            Pageable pageable);

    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = :roleName AND u.id NOT IN (SELECT u2.id FROM User u2 JOIN u2.roles r2 WHERE r2.name = 'Administrators')")
    Long countUsersWithRole(@Param("roleName") String roleName);

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdDate >= :startDate AND u.id NOT IN (SELECT u2.id FROM User u2 JOIN u2.roles r WHERE r.name = 'Administrators')")
    Long countByCreatedDateAfter(@Param("startDate") java.util.Date startDate);

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdDate BETWEEN :startDate AND :endDate AND u.id NOT IN (SELECT u2.id FROM User u2 JOIN u2.roles r WHERE r.name = 'Administrators')")
    Long countByCreatedDateBetween(@Param("startDate") java.util.Date startDate,
            @Param("endDate") java.util.Date endDate);

    @Query("""
            SELECT u.id as id,
                   u.profile.fullName as landlordName,
                   u.profile.email as email,
                   (SELECT COUNT(r2) FROM Room r2 WHERE r2.user.id = u.id AND r2.isRemoved = 0 AND r2.hidden = 0 AND r2.approval = 1) as roomCount,
                   COALESCE((SELECT SUM(t.amount) FROM Wallet w JOIN w.transactions t WHERE w.user.id = u.id), 0) as totalRevenue
            FROM User u
            JOIN u.roles ro
            WHERE ro.name = 'Landlords'
            AND u.id NOT IN (SELECT u2.id FROM User u2 JOIN u2.roles r2 WHERE r2.name = 'Administrators')
            AND (SELECT COUNT(r3) FROM Room r3 WHERE r3.user.id = u.id AND r3.isRemoved = 0 AND r3.hidden = 0 AND r3.approval = 1) > 0
            ORDER BY (SELECT COUNT(r4) FROM Room r4 WHERE r4.user.id = u.id AND r4.isRemoved = 0 AND r4.hidden = 0 AND r4.approval = 1) DESC
            """)
    List<Object[]> getTopLandlordsByRoomCount();

    // Query for monthly user registration statistics
    @Query("SELECT FUNCTION('DATE_FORMAT', u.createdDate, '%Y-%m') as month, COUNT(u.id) as userCount " +
            "FROM User u " +
            "WHERE u.createdDate >= :startDate " +
            "AND u.id NOT IN (SELECT u2.id FROM User u2 JOIN u2.roles r WHERE r.name = 'Administrators') " +
            "GROUP BY FUNCTION('DATE_FORMAT', u.createdDate, '%Y-%m') " +
            "ORDER BY month DESC")
    List<Object[]> getMonthlyUserRegistrationStatistics(@Param("startDate") java.util.Date startDate);

    // Query to count administrators specifically
    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = 'Administrators'")
    Long countAdministrators();

}
