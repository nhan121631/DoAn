package com.ants.ktc.ants_ktc.entities;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "users")
@Getter
@Setter
@ToString(exclude = "profile")
@EqualsAndHashCode(callSuper = true)
public class User extends BaseEntity {
    @Column(name = "username", unique = true, nullable = false)
    private String username;
    @Column(name = "password")
    private String password;

    @Column(name = "resetpasswordcode")
    private String resetPasswordCode;

    @Column(name = "resetpasswordcodecreationtime")
    private LocalDateTime resetPasswordCodeCreationTime;

    @Column(name = "is_active", nullable = false, columnDefinition = "int default 0")
    private int isActive;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "profile_id", referencedColumnName = "id")
    private UserProfile profile;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Requirement> requirements;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Booking> bookings;

    // Quan hệ với Messages
    @OneToMany(mappedBy = "fromUser", fetch = FetchType.LAZY)
    private List<Messages> sentMessages;

    @OneToMany(mappedBy = "toUser", fetch = FetchType.LAZY)
    private List<Messages> receivedMessages;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", referencedColumnName = "id")
    private Wallet wallet;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Room> rooms;

    @ManyToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private List<Role> roles;

}