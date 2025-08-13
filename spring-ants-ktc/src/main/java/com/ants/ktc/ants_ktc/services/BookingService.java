package com.ants.ktc.ants_ktc.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.repositories.BookingJpaRepository;

@Service
public class BookingService {

    @Autowired
    private BookingJpaRepository bookingJpaRepository;

    
}
