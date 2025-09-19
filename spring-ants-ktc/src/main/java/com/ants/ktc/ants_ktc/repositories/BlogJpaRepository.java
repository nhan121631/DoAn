package com.ants.ktc.ants_ktc.repositories;

import com.ants.ktc.ants_ktc.entities.Blog;
import com.ants.ktc.ants_ktc.enums.Category;
import com.ants.ktc.ants_ktc.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BlogJpaRepository extends JpaRepository<Blog, UUID> {

    // Tìm theo slug (dùng để render blog detail)
    Optional<Blog> findBySlug(String slug);

    // Lấy tất cả blog đã publish theo category (dùng cho FE list)
    Page<Blog> findByCategoryAndStatus(Category category, Status status, Pageable pageable);

    // Lấy tất cả blog đã publish (không phân loại)
    Page<Blog> findByStatus(Status status, Pageable pageable);

    // Search theo title (cho Admin quản lý blog)
    @Query("SELECT b FROM Blog b WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Blog> searchByTitle(@Param("keyword") String keyword, Pageable pageable);
}
