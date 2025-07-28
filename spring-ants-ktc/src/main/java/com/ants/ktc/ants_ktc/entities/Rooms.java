package com.ants.ktc.ants_ktc.entities;


import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "rooms")
@Data
@EqualsAndHashCode(callSuper = true)
public class Rooms extends BaseEntity {
    private String title;
    private String description;
    private Double price_month;
    private Double price_deposit;
    private int available;
    private int approval;
    private int hidden;
    private Date post_start_date;
    private Date post_end_date;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Images> images = new ArrayList<>(); 

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostType> postTypes = new ArrayList<>();
    
    @ManyToOne
    @JoinColumn(name = "post_type_id")
    private PostType postType;
}
