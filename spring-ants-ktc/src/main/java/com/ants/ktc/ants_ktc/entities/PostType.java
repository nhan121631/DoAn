package com.ants.ktc.ants_ktc.entities;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "post_type")
@Data
@EqualsAndHashCode
public class PostType {
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;
   private int code;
   private String name;
   private Double price_per_day;
    
   @OneToMany(mappedBy = "postType", cascade = CascadeType.ALL, orphanRemoval = true)
   private List<Rooms> rooms;
}
