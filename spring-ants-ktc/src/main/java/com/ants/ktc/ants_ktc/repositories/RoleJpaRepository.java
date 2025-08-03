package com.ants.ktc.ants_ktc.repositories;

import com.ants.ktc.ants_ktc.entities.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID; // Bổ sung import UUID

@Repository
public interface RoleJpaRepository extends JpaRepository<Role, UUID> { // THAY LONG BẰNG UUID Ở ĐÂY
    // Phương thức để tìm kiếm Role theo tên
    Optional<Role> findByName(String name);
}