package com.ants.ktc.ants_ktc.entities.convenient;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "convenients")
public class Convenient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "convenient_id")
    private Long convenientId;

    private String name;

    @OneToMany(mappedBy = "convenient")
    private List<RoomConvenient> roomConvenients;

}
