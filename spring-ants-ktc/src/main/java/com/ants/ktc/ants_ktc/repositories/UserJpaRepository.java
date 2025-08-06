package com.ants.ktc.ants_ktc.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.User;

@Repository
public interface UserJpaRepository extends JpaRepository<User, UUID> {
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
            LEFT JOIN u.roles r
            LEFT JOIN FETCH u.profile p
            LEFT JOIN FETCH p.address a
            LEFT JOIN FETCH a.ward w
            LEFT JOIN FETCH w.district d
            LEFT JOIN FETCH d.province pr
            WHERE r.name != 'ROLE_ADMIN' OR r IS NULL
            """, countQuery = "SELECT count(u) FROM User u JOIN u.roles r WHERE r.name != 'ROLE_ADMIN'")
    Page<User> findAllExcludingAdmins(Pageable pageable);

}
