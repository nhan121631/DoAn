package com.ants.ktc.ants_ktc.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.ants.ktc.ants_ktc.repositories.projection.UserProfileProjection;
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
        SELECT u.id AS id, p.fullName AS fullName
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

}
