package com.ants.ktc.ants_ktc.entities;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
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
   private String code;

   @Column(name = "name", nullable = false, length = 100)
   private String name;

   @Column(name = "price_per_day", nullable = false)
   private Double pricePerDay;

   @Column(name = "description", length = 255)
   private String description;

   @Column(name = "is_remove", nullable = false, columnDefinition = "int default 0")
   private int isRemove;

   @OneToMany(mappedBy = "postType", fetch = FetchType.LAZY)
   private List<Room> rooms;
}
