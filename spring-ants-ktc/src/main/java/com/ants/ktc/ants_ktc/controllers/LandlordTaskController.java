package com.ants.ktc.ants_ktc.controllers;

import com.ants.ktc.ants_ktc.dtos.LandlordTask.LandlordTaskCreateDto;
import com.ants.ktc.ants_ktc.dtos.LandlordTask.LandlordTaskResponseDto;
import com.ants.ktc.ants_ktc.dtos.LandlordTask.LandlordTaskUpdateDto;
import com.ants.ktc.ants_ktc.services.LandlordTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/landlord-tasks")
@RequiredArgsConstructor
public class LandlordTaskController {

    private final LandlordTaskService taskService;

    @PostMapping
    public ResponseEntity<LandlordTaskResponseDto> createTask(
            @Valid @RequestBody LandlordTaskCreateDto dto) {
        return ResponseEntity.ok(taskService.createTask(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LandlordTaskResponseDto> updateTask(
            @PathVariable("id") UUID taskId,
            @Valid @RequestBody LandlordTaskUpdateDto dto) {
        LandlordTaskResponseDto response = taskService.updateTask(taskId, dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/landlord/{landlordId}")
    public ResponseEntity<List<LandlordTaskResponseDto>> getTasksByLandlord(
            @PathVariable("landlordId") UUID landlordId) {
        return ResponseEntity.ok(taskService.getTasksByLandlord(landlordId));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<LandlordTaskResponseDto> getTaskDetail(@PathVariable("taskId") UUID taskId) {
        return ResponseEntity.ok(taskService.getTaskDetail(taskId));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable("taskId") UUID taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }
}