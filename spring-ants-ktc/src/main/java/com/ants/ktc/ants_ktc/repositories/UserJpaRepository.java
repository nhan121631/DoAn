package com.ants.ktc.ants_ktc.repositories;

import java.util.Optional;
import java.util.UUID;

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

}
