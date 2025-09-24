package com.ants.ktc.ants_ktc.repositories;

import com.ants.ktc.ants_ktc.entities.Ads;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Repository
public interface AdsRepository extends JpaRepository<Ads, UUID> {

    @Query("SELECT a FROM Ads a WHERE a.isActive = true AND a.startDate <= :now AND a.endDate >= :now ORDER BY a.priority DESC, a.createdDate DESC")
    List<Ads> findActiveAds(@Param("now") Date now);

    @Query("SELECT a FROM Ads a WHERE a.isActive = true AND a.startDate <= :now AND a.endDate >= :now AND a.position = :position ORDER BY a.priority DESC, a.createdDate DESC")
    List<Ads> findActiveAdsByPosition(@Param("now") Date now, @Param("position") Ads.AdsPosition position);

    @Query("SELECT a FROM Ads a WHERE a.title LIKE %:keyword% OR a.description LIKE %:keyword%")
    Page<Ads> findByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT a FROM Ads a WHERE a.position = :position")
    Page<Ads> findByPosition(@Param("position") Ads.AdsPosition position, Pageable pageable);

    @Query("SELECT a FROM Ads a WHERE a.isActive = :isActive")
    Page<Ads> findByIsActive(@Param("isActive") Boolean isActive, Pageable pageable);

    @Query("SELECT a FROM Ads a WHERE a.startDate <= :endDate AND a.endDate >= :startDate")
    List<Ads> findConflictingAds(@Param("startDate") Date startDate, @Param("endDate") Date endDate);
}
