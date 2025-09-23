package com.ants.ktc.ants_ktc.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "ads")
@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class Ads extends BaseEntity {

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "image_public_id", length = 255)
    private String imagePublicId;

    @Column(name = "link_url", length = 500)
    private String linkUrl;

    @Column(name = "position", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private AdsPosition position;

    @Column(name = "start_date", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date startDate;

    @Column(name = "end_date", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date endDate;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "priority", nullable = false)
    private Integer priority = 0;

    public enum AdsPosition {
        LEFT, RIGHT, TOP, BOTTOM, CENTER
    }

    // Helper method to check if ad is currently active
    public boolean isCurrentlyActive() {
        Date now = new Date();
        return isActive && startDate != null && endDate != null &&
                now.after(startDate) && now.before(endDate);
    }
}
