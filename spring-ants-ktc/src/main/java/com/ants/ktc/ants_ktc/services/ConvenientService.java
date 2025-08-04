package com.ants.ktc.ants_ktc.services;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.dtos.convenient.ConvenientResponseDto;
import com.ants.ktc.ants_ktc.dtos.convenient.CreateConvenientRequestDto;
import com.ants.ktc.ants_ktc.entities.Convenient;
import com.ants.ktc.ants_ktc.repositories.ConvenientsRepository;

@Service
public class ConvenientService {
    @Autowired
    private ConvenientsRepository convenientsRepository;

    private ConvenientResponseDto convertToDto(Convenient convenient) {
        ConvenientResponseDto dto = new ConvenientResponseDto();
        dto.setId(convenient.getId());
        dto.setName(convenient.getName());
        return dto;
    }

    public List<ConvenientResponseDto> getAllConvenient() {
        List<Convenient> allConvenients = convenientsRepository.findAll();
        return allConvenients.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Method to create a new convenient
    public ConvenientResponseDto createConvenient(CreateConvenientRequestDto requestDto) {
        Convenient convenient = new Convenient();
        convenient.setName(requestDto.getName());
        Convenient savedConvenient = convenientsRepository.save(convenient);
        return convertToDto(savedConvenient);
    }

    public void deleteConvenient(Long id) {
        if (!convenientsRepository.existsById(id)) {
            throw new IllegalArgumentException("Convenient with id " + id + " does not exist");
        }
        convenientsRepository.deleteById(id);
    }

    // // get convennient by roomid(UUID)
    public List<ConvenientResponseDto> getConvenientByRoomId(UUID id) {
        List<Convenient> convenients = convenientsRepository.findByRoomId(id);
        return convenients.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
}
