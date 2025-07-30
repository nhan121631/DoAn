package com.ants.ktc.ants_ktc.entities;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "post_type")
@Data
@EqualsAndHashCode(callSuper = true)
public class PostType extends BaseEntity {

   @Column(name = "code", nullable = false, unique = true)
   private int code;

   @Column(name = "name", nullable = false, length = 100)
   private String name;

   @Column(name = "price_per_day", nullable = false)
   private Double price_per_day;

   @OneToMany(mappedBy = "postType", cascade = CascadeType.ALL, orphanRemoval = true)
   private List<Rooms> rooms;
}
