package com.ants.ktc.ants_ktc.dtos.manage_account;

import java.util.UUID;

public class UserAccountProjection {
    private UUID id;
    private String username;
    private int isActive;
    private String email;
    private String phoneNumber;

    public UserAccountProjection(UUID id, String username, int isActive, String email, String phoneNumber) {
        this.id = id;
        this.username = username;
        this.isActive = isActive;
        this.email = email;
        this.phoneNumber = phoneNumber;
    }

    // Getters cho các trường
    public UUID getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public int getIsActive() {
        return isActive;
    }

    public String getEmail() {
        return email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }
}
