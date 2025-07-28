package com.ants.ktc.ants_ktc.entities.role;

import java.util.List;

import com.ants.ktc.ants_ktc.entities.BaseEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;

import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "role")
@Data
@EqualsAndHashCode(callSuper = true)

public class Role extends BaseEntity {

    private String code;
    private String name;

    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserRole> userRoles;

}
