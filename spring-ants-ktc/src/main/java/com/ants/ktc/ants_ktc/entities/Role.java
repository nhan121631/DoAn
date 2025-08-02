package com.ants.ktc.ants_ktc.entities;

import java.util.List;

import org.apache.catalina.User;

import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "roles")
@Data
@EqualsAndHashCode(callSuper = true)

public class Role extends BaseEntity {

    private String code;
    private String name;

    @ManyToMany(mappedBy = "roles")
    private List<User> users;

}