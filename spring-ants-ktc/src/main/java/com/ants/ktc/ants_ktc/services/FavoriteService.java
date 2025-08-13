package com.ants.ktc.ants_ktc.services;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ants.ktc.ants_ktc.entities.Favorite;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.repositories.FavoriteJpaRepository;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;

@Service
public class FavoriteService {
    @Autowired
    private UserJpaRepository userJpaRepository;
    @Autowired
    private RoomJpaRepository roomJpaRepository;
    @Autowired
    private FavoriteJpaRepository favoriteJpaRepository;
    @Transactional
    public void addFavorite(UUID userId, UUID roomId) {
        if (favoriteJpaRepository.existsByUserIdAndRoomId(userId, roomId)) {
            throw new IllegalArgumentException("Room already in favorites");
        }

        User user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Room room = roomJpaRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        Favorite favorite = new Favorite();
        favorite.setId(UUID.randomUUID());
        favorite.setUser(user);
        favorite.setRoom(room);

        favoriteJpaRepository.save(favorite);
    }
    
}
