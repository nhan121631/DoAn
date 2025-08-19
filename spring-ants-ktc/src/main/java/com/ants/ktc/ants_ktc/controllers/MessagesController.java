package com.ants.ktc.ants_ktc.controllers;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ants.ktc.ants_ktc.dtos.message.MessageResponseDto;
import com.ants.ktc.ants_ktc.services.MessagesService;

@RestController
@RequestMapping("/api/messages")
public class MessagesController {
    @Autowired
    private MessagesService messagesService;

    // Lấy lịch sử tin nhắn giữa 2 user (cả 2 chiều), trả về DTO
    @GetMapping
    public List<MessageResponseDto> getMessagesBetweenUsers(
            @RequestParam(value = "user1") UUID user1,
            @RequestParam(value = "user2") UUID user2,
            @RequestParam(value = "size", required = false) Integer size,
            @RequestParam(value = "before", required = false) String before) {
        java.time.LocalDateTime beforeTime = null;
        if (before != null && !before.isEmpty()) {
            beforeTime = java.time.LocalDateTime.parse(before);
        }
        return messagesService.getMessagesBetweenUsers(user1, user2, size, beforeTime);
    }

    @GetMapping("/users")
    public List<Map<String, Object>> getChatUsers(@RequestParam(value = "userId") UUID userId) {
        return messagesService.getChatUsers(userId);
    }
}
