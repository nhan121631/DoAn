
package com.ants.ktc.ants_ktc.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.dtos.message.MessageResponseDto;
import com.ants.ktc.ants_ktc.entities.Messages;
import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.repositories.MessagesJpaRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;

@Service
public class MessagesService {
    @Autowired
    private MessagesJpaRepository messagesRepository;

    @Autowired
    private UserJpaRepository userRepository;

    @Async
    public void saveMessageAsync(String content, UUID fromUserId, UUID toUserId) {
        saveMessage(content, fromUserId, toUserId);
    }

    public MessageResponseDto saveMessage(String content, UUID fromUserId, UUID toUserId) {
        User fromUser = userRepository.findById(fromUserId).orElseThrow();
        User toUser = userRepository.findById(toUserId).orElseThrow();
        Messages message = new Messages();
        message.setContent(content);
        message.setFromUser(fromUser);
        message.setToUser(toUser);
        message.setSentAt(LocalDateTime.now());
        message.setRead(false);
        Messages savedMessage = messagesRepository.save(message);
        return MessageResponseDto.builder()
                .id(savedMessage.getId())
                .content(savedMessage.getContent())
                .fromUser(savedMessage.getFromUser().getId())
                .toUser(savedMessage.getToUser().getId())
                .sentAt(savedMessage.getSentAt())
                .isRead(savedMessage.isRead())
                .build();
    }

    public List<MessageResponseDto> getMessagesBetweenUsers(UUID user1, UUID user2, Integer size,
            LocalDateTime before) {
        List<Messages> messages;
        Pageable pageable = Pageable.ofSize(size != null && size > 0 ? size : 20);
        if (before != null) {
            messages = messagesRepository.findChatHistoryBetweenUsersBefore(user1, user2, before, pageable);
        } else {
            messages = messagesRepository.findLatestChatHistoryBetweenUsers(user1, user2, pageable);
        }
        List<MessageResponseDto> result = new java.util.ArrayList<>();
        for (Messages m : messages) {
            MessageResponseDto dto = MessageResponseDto.builder()
                    .id(m.getId())
                    .content(m.getContent())
                    .fromUser(m.getFromUser() != null ? m.getFromUser().getId() : null)
                    .toUser(m.getToUser() != null ? m.getToUser().getId() : null)
                    .sentAt(m.getSentAt())
                    .isRead(m.isRead())
                    .build();
            result.add(dto);
        }
        // Đảo ngược lại để client hiển thị từ cũ đến mới
        java.util.Collections.reverse(result);
        return result;
    }

    public List<Map<String, Object>> getChatUsers(UUID userId) {
        Set<UUID> addedUserIds = new java.util.HashSet<>();
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        messagesRepository.findAll().forEach(m -> {
            com.ants.ktc.ants_ktc.entities.User other = null;
            if (m.getFromUser().getId().equals(userId)) {
                other = m.getToUser();
            } else if (m.getToUser().getId().equals(userId)) {
                other = m.getFromUser();
            }
            if (other != null && addedUserIds.add(other.getId())) {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", other.getId());
                String name = (other.getProfile() != null && other.getProfile().getFullName() != null
                        && !other.getProfile().getFullName().isEmpty())
                                ? other.getProfile().getFullName()
                                : other.getUsername();
                map.put("name", name);

                // Đếm số tin nhắn chưa đọc từ user này gửi tới userId
                int unreadCount = messagesRepository
                        .findByFromUser_IdAndToUser_IdAndIsReadFalse(other.getId(), userId)
                        .size();
                map.put("unreadCount", unreadCount);

                result.add(map);
            }
        });
        return result;
    }

    public void markMessagesAsRead(UUID fromUserId, UUID toUserId) {
        // Update all messages from fromUserId to toUserId, set isRead=true
        List<Messages> unreadMessages = messagesRepository.findByFromUser_IdAndToUser_IdAndIsReadFalse(fromUserId,
                toUserId);
        System.out.println("[MessagesService] Số tin nhắn chưa đọc sẽ cập nhật: " + unreadMessages.size());
        for (Messages m : unreadMessages) {
            m.setRead(true);
        }
        messagesRepository.saveAll(unreadMessages);
        System.out.println("[MessagesService] Đã lưu trạng thái đã đọc cho " + unreadMessages.size() + " tin nhắn từ "
                + fromUserId + " đến " + toUserId);
    }

    public List<Messages> getUnreadMessages(UUID fromUserId, UUID toUserId) {
        return messagesRepository.findByFromUser_IdAndToUser_IdAndIsReadFalse(fromUserId, toUserId);
    }
}
