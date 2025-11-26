package com.ants.ktc.ants_ktc.controllers;

import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;
import com.ants.ktc.ants_ktc.services.RoomSuggestionService;
import com.ants.ktc.ants_ktc.services.machinelearning.MatchingMLService;

@RestController
@RequestMapping("/api/test")
public class TestController {

    private static final Logger logger = LoggerFactory.getLogger(TestController.class);

    @Autowired
    private RoomSuggestionService roomSuggestionService;

    // NEW: Machine Learning Service for Content-Based Filtering
    @Autowired
    private MatchingMLService matchingMLService;

    @PostMapping("/send-suggestions")
    public ResponseEntity<String> testSendSuggestions() {
        try {
            roomSuggestionService.sendRoomSuggestionsToAllUsers();
            return ResponseEntity.ok("Room suggestions feature temporarily disabled");
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Error sending suggestions: " + e.getMessage());
        }
    }

    @PostMapping("/send-suggestions-single")
    public ResponseEntity<String> testSendSuggestionsToSingleUser(@RequestParam(value = "username") String username) {
        try {
            roomSuggestionService.testSuggestionForUser(username);
            return ResponseEntity.ok("Room suggestions feature temporarily disabled for user: " + username);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Error sending suggestions: " + e.getMessage());
        }
    }


    @PostMapping("/ml/send-suggestions-all")
    public ResponseEntity<String> testMLSendSuggestionsToAllUsers() {
        try {
            logger.info("=== ML ENDPOINT TEST: Sending suggestions to all users ===");
            System.out.println("=== ML ENDPOINT TEST: Sending suggestions to all users ===");

            logger.info("🔄 About to call matchingMLService.sendRoomSuggestionsToAllUsers()...");
            System.out.println("🔄 About to call matchingMLService.sendRoomSuggestionsToAllUsers()...");

            matchingMLService.sendRoomSuggestionsToAllUsers();

            String successMessage = "ML-based room suggestions sent successfully to all users with preferences";
            logger.info("ML TEST RESULT: {}", successMessage);
            System.out.println("ML TEST RESULT: " + successMessage);
            logger.info("=== END ML ENDPOINT TEST ===");
            System.out.println("=== END ML ENDPOINT TEST ===");
            return ResponseEntity.ok(successMessage);
        } catch (Exception e) {
            logger.error("ML TEST ERROR: Error sending ML suggestions: {}", e.getMessage(), e);
            System.out.println("ML TEST ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body("Error sending ML suggestions: " + e.getMessage());
        }
    }

    @PostMapping("/ml/send-suggestions-single")
    public ResponseEntity<String> testMLSendSuggestionsToSingleUser(@RequestParam String username) {
        try {
            logger.info("=== ML ENDPOINT TEST: Sending suggestions to user: {} ===", username);
            matchingMLService.testSuggestionForUser(username);
            String successMessage = "ML-based room suggestions sent successfully for user: " + username;
            logger.info("ML TEST RESULT: {}", successMessage);
            logger.info("=== END ML ENDPOINT TEST ===");
            return ResponseEntity.ok(successMessage);
        } catch (Exception e) {
            logger.error("ML TEST ERROR: Error sending ML suggestions for user {}: {}", username, e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body("Error sending ML suggestions: " + e.getMessage());
        }
    }

    /**
     * Get user preference profile built from favorites/bookings
     * Shows ML algorithm's understanding of user preferences
     */
    @GetMapping("/ml/user-profile")
    public ResponseEntity<?> testGetUserPreferenceProfile(@RequestParam(value = "username") String username) {
        try {
            logger.info("=== ML ENDPOINT TEST: Getting user preference profile for: {} ===", username);
            var profileInfo = matchingMLService.getUserPreferenceProfile(username);
            logger.info("ML TEST RESULT - User Profile Data: {}", profileInfo);
            logger.info("=== END ML ENDPOINT TEST ===");
            return ResponseEntity.ok(profileInfo);
        } catch (Exception e) {
            logger.error("ML TEST ERROR: Error getting user preference profile for {}: {}", username, e.getMessage(),
                    e);
            return ResponseEntity.badRequest()
                    .body("Error getting user preference profile: " + e.getMessage());
        }
    }

    @GetMapping("/ml/similarity-score")
    public ResponseEntity<?> testCalculateSimilarityScore(
            @RequestParam(value = "username") String username,
            @RequestParam(value = "roomId") String roomId) {
        try {
            logger.info("=== ML ENDPOINT TEST: Calculating similarity score for user: {} and room: {} ===", username,
                    roomId);
            UUID roomUUID = UUID.fromString(roomId);
            var similarityInfo = matchingMLService.calculateSimilarityScore(username, roomUUID);
            logger.info("ML TEST RESULT - Similarity Score Data: {}", similarityInfo);
            logger.info("=== END ML ENDPOINT TEST ===");
            return ResponseEntity.ok(similarityInfo);
        } catch (Exception e) {
            logger.error("ML TEST ERROR: Error calculating similarity score for user {} and room {}: {}", username,
                    roomId, e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body("Error calculating similarity score: " + e.getMessage());
        }
    }

    /**
     * Get ML algorithm statistics and configuration
     * Shows algorithm details and database statistics
     */
    @GetMapping("/ml/statistics")
    public ResponseEntity<?> testGetMLStatistics() {
        try {
            logger.info("=== ML ENDPOINT TEST: Getting ML algorithm statistics ===");
            var statistics = matchingMLService.getMLStatistics();
            logger.info("ML TEST RESULT - Algorithm Statistics: {}", statistics);
            logger.info("=== END ML ENDPOINT TEST ===");
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            logger.error("ML TEST ERROR: Error getting ML statistics: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body("Error getting ML statistics: " + e.getMessage());
        }
    }

    @GetMapping("/ml/rooms-in-radius")
    public ResponseEntity<?> testGetRoomsInRadius(@RequestParam(value = "username") String username) {
        try {
            logger.info("=== ML ENDPOINT TEST: Getting rooms in radius for user: {} ===", username);
            Map<String, Object> roomsInRadius = matchingMLService.getRoomsInRadius(username);
            Object totalRooms = roomsInRadius.get("totalRooms");
            logger.info("ML TEST RESULT - Rooms in Radius: {} rooms found", totalRooms);
            logger.info("=== END ML ENDPOINT TEST ===");
            return ResponseEntity.ok(roomsInRadius);
        } catch (Exception e) {
            logger.error("ML TEST ERROR: Error getting rooms in radius for {}: {}", username, e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body("Error getting rooms in radius: " + e.getMessage());
        }
    }

    /**
     * Debug user ML settings and data
     */
    @GetMapping("/ml/debug-user")
    public ResponseEntity<?> debugUserForML(@RequestParam(value = "username") String username) {
        try {
            logger.info("[TestController] Debug user ML data for: {}", username);
            var debugInfo = matchingMLService.debugUserForML(username);
            logger.info("[TestController] Debug info returned: {}", debugInfo);
            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            logger.error("[TestController] Error debugging user ML data for {}: {}", username, e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body("Error debugging user ML data for " + username + ": " + e.getMessage());
        }
    }
}
