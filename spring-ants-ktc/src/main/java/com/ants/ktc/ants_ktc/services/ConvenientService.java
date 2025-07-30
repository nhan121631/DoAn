package com.ants.ktc.ants_ktc.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.dtos.convenient.ConvenientResponseDto;
import com.ants.ktc.ants_ktc.dtos.convenient.CreateConvenientRequestDto;
import com.ants.ktc.ants_ktc.entities.convenient.Convenients;
import com.ants.ktc.ants_ktc.repositories.ConvenientsRepository;

@Service
public class ConvenientService {
    @Autowired
    private ConvenientsRepository convenientsRepository;

    private ConvenientResponseDto convertToDto(Convenients convenient) {
        ConvenientResponseDto dto = new ConvenientResponseDto();
        dto.setId(convenient.getConvenientId());
        dto.setName(convenient.getName());
        return dto;
    }

    public List<ConvenientResponseDto> getAllConvenient() {
        List<Convenients> allConvenients = convenientsRepository.findAll();
        return allConvenients.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Method to create a new convenient
    public ConvenientResponseDto createConvenient(CreateConvenientRequestDto requestDto) {
        Convenients convenient = new Convenients();
        convenient.setName(requestDto.getName());
        Convenients savedConvenient = convenientsRepository.save(convenient);
        return convertToDto(savedConvenient);
    }

    public void deleteConvenient(Long id) {
        convenientsRepository.deleteById(id);
    }
}
