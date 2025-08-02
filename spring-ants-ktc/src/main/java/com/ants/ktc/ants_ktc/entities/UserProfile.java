package com.ants.ktc.ants_ktc.entities;

import com.ants.ktc.ants_ktc.entities.address.Address;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "user_profiles")
@Data
@EqualsAndHashCode(callSuper = true)
public class UserProfile extends BaseEntity {

    @Column(name = "email")
    private String email;

    @Column(name = "phone_number")
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

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id", referencedColumnName = "id")
    private Address address;

    @OneToOne(mappedBy = "profile", fetch = FetchType.LAZY)
    private User user;

}
