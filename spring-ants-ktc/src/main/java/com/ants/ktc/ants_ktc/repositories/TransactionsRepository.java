package com.ants.ktc.ants_ktc.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ants.ktc.ants_ktc.entities.Transaction;

public interface TransactionsRepository extends JpaRepository<Transaction, UUID> {

}
