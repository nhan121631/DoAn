package com.ants.ktc.ants_ktc.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ants.ktc.ants_ktc.services.RoomSuggestionService;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private RoomSuggestionService roomSuggestionService;

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
}
