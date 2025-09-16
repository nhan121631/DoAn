package com.ants.ktc.ants_ktc.services;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ants.ktc.ants_ktc.dtos.LandlordTask.LandlordTaskCreateDto;
import com.ants.ktc.ants_ktc.dtos.LandlordTask.LandlordTaskResponseDto;
import com.ants.ktc.ants_ktc.dtos.LandlordTask.LandlordTaskUpdateDto;
import com.ants.ktc.ants_ktc.entities.LandlordTask;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.repositories.LandlordTaskJpaRepository;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;

import jakarta.persistence.EntityNotFoundException;

@Service

public class LandlordTaskService {
    @Autowired
    private LandlordTaskJpaRepository taskRepository;
    @Autowired
    private UserJpaRepository userRepository;
    @Autowired
    private RoomJpaRepository roomRepository;

    public LandlordTaskResponseDto createTask(LandlordTaskCreateDto dto) {
        User landlord = userRepository.findById(UUID.fromString(dto.getLandlordId()))
                .orElseThrow(() -> new EntityNotFoundException("Landlord not found"));

        Room room = null;
        if (dto.getRoomId() != null) {
            room = roomRepository.findById(UUID.fromString(dto.getRoomId()))
                    .orElseThrow(() -> new EntityNotFoundException("Room not found"));
        }

        LandlordTask task = new LandlordTask();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setDueDate(dto.getDueDate());
        task.setStatus(dto.getStatus());
        task.setPriority(dto.getPriority());
        task.setLandlord(landlord);
        task.setRoom(room);

        task = taskRepository.save(task);
        return convertToDto(task);
    }

    public List<LandlordTaskResponseDto> getTasksByLandlord(UUID landlordId) {
        return taskRepository.findByLandlordId(landlordId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public LandlordTaskResponseDto getTaskDetail(UUID taskId) {
        LandlordTask task = taskRepository.findByIdWithDetails(taskId);
        if (task == null)
            throw new EntityNotFoundException("Task not found");
        return convertToDto(task);
    }

    public void deleteTask(UUID taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new EntityNotFoundException("Task not found");
        }
        taskRepository.deleteById(taskId);
    }

    @Transactional
    public LandlordTaskResponseDto updateTask(UUID taskId, LandlordTaskUpdateDto dto) {
        LandlordTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        if (dto.getTitle() != null)
            task.setTitle(dto.getTitle());
        if (dto.getDescription() != null)
            task.setDescription(dto.getDescription());
        if (dto.getDueDate() != null)
            task.setDueDate(dto.getDueDate());
        if (dto.getStatus() != null)
            task.setStatus(dto.getStatus());
        if (dto.getPriority() != null)
            task.setPriority(dto.getPriority());

        return convertToDto(task);
        // Không cần taskRepository.save(task) vì @Transactional sẽ auto flush
    }

    // 🔑 convert Entity -> DTO
    public LandlordTaskResponseDto convertToDto(LandlordTask task) {
        LandlordTaskResponseDto dto = new LandlordTaskResponseDto();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setDueDate(task.getDueDate());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());

        if (task.getLandlord() != null) {
            dto.setLandlordId(task.getLandlord().getId().toString());
            dto.setLandlordName(
                    task.getLandlord().getProfile() != null ? task.getLandlord().getProfile().getFullName() : null);
        }
        if (task.getRoom() != null) {
            dto.setRoomId(task.getRoom().getId().toString());
            dto.setRoomTitle(task.getRoom().getTitle());
        }
        return dto;
    }
}
