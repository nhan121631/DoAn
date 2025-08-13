package com.ants.ktc.ants_ktc.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;

@Service
public class AdminStatisticsService {
    @Autowired
    private UserJpaRepository userRepository;
    @Autowired
    private RoomJpaRepository roomRepository;

    public Long countInactiveUsers() {
        return userRepository.countInactiveUsers();
    }

    public Long countAcceptedRoom() {
        return roomRepository.countAcceptedApprovalRooms();
    }

    public Long countPendingRoom() {
        return roomRepository.countPendingApprovalRooms();
    }

    public Long countTotalRoom() {
        return roomRepository.countTotalApprovalRooms();
    }
}
