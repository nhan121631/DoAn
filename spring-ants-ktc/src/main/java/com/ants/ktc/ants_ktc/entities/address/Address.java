package com.ants.ktc.ants_ktc.entities.address;

import com.ants.ktc.ants_ktc.entities.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "addresses")
@Data
@EqualsAndHashCode(callSuper = true)
public class Address extends BaseEntity {

    @Column(name = "name_street")
    private String street;

    @ManyToOne
    @JoinColumn(name = "ward_id")
    private Ward ward;
}