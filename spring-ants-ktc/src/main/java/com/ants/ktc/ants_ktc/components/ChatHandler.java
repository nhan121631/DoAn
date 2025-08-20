package com.ants.ktc.ants_ktc.components;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.services.MessagesService;
import com.ants.ktc.ants_ktc.services.UserService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.transaction.annotation.Transactional;

@Component
@RestController
public class ChatHandler extends TextWebSocketHandler {
    @Autowired
    private UserService userService;
    @Autowired
    private MessagesService messagesService;

    // REST API: Lấy danh sách userId đang online
    @GetMapping("/api/online-users")
    public java.util.Set<String> getOnlineUsers() {
        return userSessions.keySet();
    }

    private final ConcurrentHashMap<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        try {
            String query = session.getUri() != null ? session.getUri().getQuery() : null;
            String userId = null;
            if (query != null && query.startsWith("userId=")) {
                userId = query.substring(7);
            } else if (query != null && query.contains("userId=")) {
                userId = query.split("userId=")[1].split("&")[0];
            }
            if (userId == null || userId.isEmpty()) {
                System.err.println("[WebSocket] userId missing in query: " + query);
                session.close();
                return;
            }
            userSessions.put(userId, session);
            System.out.println("User " + userId + " connected.");
        } catch (Exception e) {
            System.err.println("[WebSocket] Error in afterConnectionEstablished: " + e.getMessage());
            e.printStackTrace();
            session.close();
        }
    }

    @Transactional
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            System.out.println("=== ======================WebSocket payload: " + message.getPayload());
            JsonNode json = objectMapper.readTree(message.getPayload());
            String type = json.has("type") ? json.get("type").asText() : "message";
            System.out.println("========================" + type + "=====================");

            if ("read".equals(type)) {
                // Handle read event
                String readFromUserId = json.has("fromUserId") && !json.get("fromUserId").isNull()
                        ? json.get("fromUserId").asText()
                        : null; // viewer
                String readToUserId = json.has("toUserId") && !json.get("toUserId").isNull()
                        ? json.get("toUserId").asText()
                        : null; // sender
                System.out.println("DEBUG: readFromUserId=" + readFromUserId + ", readToUserId=" + readToUserId);
                if (readFromUserId == null || readToUserId == null) {
                    System.err.println("[WebSocket] read event missing fromUserId or toUserId");
                    return;
                }
                UUID fromUUID = UUID.fromString(readToUserId); // sender
                UUID toUUID = UUID.fromString(readFromUserId); // viewer
                java.util.List<com.ants.ktc.ants_ktc.entities.Messages> unreadMessages = messagesService
                        .getUnreadMessages(fromUUID, toUUID);
                messagesService.markMessagesAsRead(fromUUID, toUUID);
                System.out.println("===============================================");
                System.out.println("[WebSocket] Mark messages as read: " + readFromUserId + " -> " + readToUserId);
                WebSocketSession senderSession = userSessions.get(readToUserId);
                if (senderSession != null && senderSession.isOpen()) {
                    for (com.ants.ktc.ants_ktc.entities.Messages m : unreadMessages) {
                        String notifyMsg = objectMapper.createObjectNode()
                                .put("fromUserId", m.getFromUser().getId().toString())
                                .put("fromUserName",
                                        m.getFromUser().getProfile() != null
                                                && m.getFromUser().getProfile().getFullName() != null
                                                        ? m.getFromUser().getProfile().getFullName()
                                                        : m.getFromUser().getUsername())
                                .put("toUserId", m.getToUser().getId().toString())
                                .put("message", m.getContent())
                                .put("sentAt", m.getSentAt() != null ? m.getSentAt().toString() : "")
                                .put("isRead", true)
                                .toString();
                        senderSession.sendMessage(new TextMessage(notifyMsg));
                    }
                }
                return;
            }

            // Handle normal message event
            String toUserId = json.has("toUserId") && !json.get("toUserId").isNull() ? json.get("toUserId").asText()
                    : null;
            String msg = json.has("message") && !json.get("message").isNull() ? json.get("message").asText() : null;
            System.out.println("[WebSocket] userSessions keys: " + userSessions.keySet());
            // Find fromUserId from session
            String fromUserId = null;
            for (var entry : userSessions.entrySet()) {
                if (entry.getValue().equals(session)) {
                    fromUserId = entry.getKey();
                    break;
                }
            }
            if (fromUserId == null) {
                System.err.println("[WebSocket] fromUserId not found for session");
                return;
            }

            // Get fromUserName
            String fromUserName = null;
            try {
                java.util.UUID uuid = java.util.UUID.fromString(fromUserId);
                User user = userService.findNameById(uuid);
                if (user != null && user.getProfile() != null && user.getProfile().getFullName() != null) {
                    fromUserName = user.getProfile().getFullName();
                } else if (user != null) {
                    fromUserName = user.getUsername();
                }
            } catch (Exception e) {
                fromUserName = fromUserId;
            }

            // Send to recipient and sender
            String jsonMsg = objectMapper.createObjectNode()
                    .put("fromUserId", fromUserId)
                    .put("fromUserName", fromUserName)
                    .put("toUserId", toUserId)
                    .put("message", msg)
                    .put("sentAt", java.time.LocalDateTime.now().toString())
                    .put("isRead", false)
                    .toString();
            WebSocketSession targetSession = userSessions.get(toUserId);
            if (targetSession != null && targetSession.isOpen()) {
                System.out.println("[WebSocket] Send to " + toUserId + ": from " + fromUserId + ", msg: " + msg);
                targetSession.sendMessage(new TextMessage(jsonMsg));
            } else {
                System.err.println("[WebSocket] Target user " + toUserId + " not online or session closed.");
            }
            if (!fromUserId.equals(toUserId)) {
                WebSocketSession senderSession = userSessions.get(fromUserId);
                if (senderSession != null && senderSession.isOpen()) {
                    System.out.println("[WebSocket] Echo to sender " + fromUserId + ": msg: " + msg);
                    senderSession.sendMessage(new TextMessage(jsonMsg));
                }
            }
            // Save message to database asynchronously
            try {
                if (fromUserId != null && toUserId != null && msg != null && !msg.trim().isEmpty()) {
                    java.util.UUID fromUUID = java.util.UUID.fromString(fromUserId);
                    java.util.UUID toUUID = java.util.UUID.fromString(toUserId);
                    messagesService.saveMessageAsync(msg, fromUUID, toUUID);
                }
            } catch (Exception ex) {
                System.err.println("[WebSocket] Error saving message to DB (async): " + ex.getMessage());
                ex.printStackTrace();
            }
        } catch (Exception e) {
            System.err.println("[WebSocket] Error in handleTextMessage: " + e.getMessage());
            e.printStackTrace();
        }
    }
}