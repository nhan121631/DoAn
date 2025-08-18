package com.ants.ktc.ants_ktc.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.Messages;

@Repository

public interface MessagesJpaRepository extends JpaRepository<Messages, UUID> {
    // Lấy tất cả tin nhắn giữa 2 user (cả 2 chiều)

    // Lấy các tin nhắn giữa 2 user, cũ hơn một mốc thời gian, giới hạn số lượng
    @Query("SELECT m FROM Messages m WHERE ((m.fromUser.id = :user1 AND m.toUser.id = :user2) OR (m.fromUser.id = :user2 AND m.toUser.id = :user1)) AND (:before IS NULL OR m.sentAt < :before) ORDER BY m.sentAt DESC")
    List<Messages> findChatHistoryBetweenUsersBefore(@Param("user1") UUID user1, @Param("user2") UUID user2,
            @Param("before") LocalDateTime before, Pageable pageable);

    // Lấy các tin nhắn mới nhất giữa 2 user (không filter thời gian)
    @Query("SELECT m FROM Messages m WHERE (m.fromUser.id = :user1 AND m.toUser.id = :user2) OR (m.fromUser.id = :user2 AND m.toUser.id = :user1) ORDER BY m.sentAt DESC")
    List<Messages> findLatestChatHistoryBetweenUsers(@Param("user1") UUID user1, @Param("user2") UUID user2,
            Pageable pageable);

    List<Messages> findByFromUser_IdAndToUser_IdAndIsReadFalse(UUID fromUserId, UUID toUserId);

}
