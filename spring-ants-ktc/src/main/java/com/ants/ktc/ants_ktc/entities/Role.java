package com.ants.ktc.ants_ktc.entities;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "roles", indexes = {
        @Index(name = "idx_role_name", columnList = "name", unique = true)
})
@Data
@EqualsAndHashCode(callSuper = true)

public class Role extends BaseEntity {

    private String code;
    private String name;

    @ManyToMany(mappedBy = "roles")
    private List<User> users;
}