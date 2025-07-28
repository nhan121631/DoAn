package com.ants.ktc.ants_ktc.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ants.ktc.ants_ktc.entities.Transactions;

public interface TransactionsRepository extends JpaRepository<Transactions, Long> {


}
