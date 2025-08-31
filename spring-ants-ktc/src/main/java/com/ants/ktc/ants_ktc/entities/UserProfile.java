package com.ants.ktc.ants_ktc.entities;

import com.ants.ktc.ants_ktc.entities.address.Address;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@ToString(exclude = "user")
@EqualsAndHashCode(callSuper = true)
public class UserProfile extends BaseEntity {

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "phone_number", unique = true)
    private String phoneNumber;

    @Column(name = "avatar")
    private String avatar;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "bin_code")
    private String binCode;

    @Column(name = "bank_number")
    private String bankNumber;

    @Column(name = "account_holder_name")
    private String accoutHolderName;

    @Column(name = "search_address", length = 500)
    private String searchAddress;

    // Lưu tọa độ đã geocoded (để tránh gọi Google API nhiều lần)
    @Column(name = "search_latitude")
    private Double searchLatitude;
    
    @Column(name = "search_longitude")
    private Double searchLongitude;

    @Column(name = "email_notifications", nullable = false)
    private boolean emailNotifications = false;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id", referencedColumnName = "id")
    private Address address;

    @OneToOne(mappedBy = "profile", fetch = FetchType.LAZY)
    private User user;

}
