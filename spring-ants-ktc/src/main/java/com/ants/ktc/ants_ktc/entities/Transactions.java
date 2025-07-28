package com.ants.ktc.ants_ktc.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "transactions")
@Getter
@Setter
public class Transactions extends BaseEntity {
    private Double amount;
    private int transactionType;
    private int status;
    private String description;

    @ManyToOne
    @JoinColumn(name = "wallet_id")
    private Wallets wallet;
}
