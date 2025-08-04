package com.ants.ktc.ants_ktc.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ants.ktc.ants_ktc.dtos.convenient.ConvenientResponseDto;
import com.ants.ktc.ants_ktc.dtos.convenient.CreateConvenientRequestDto;
import com.ants.ktc.ants_ktc.services.ConvenientService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/convenients")
public class ConvenientController {

    @Autowired
    private ConvenientService convenientService;

    @GetMapping()
    public List<ConvenientResponseDto> getAllConvenients() {
        return (List<ConvenientResponseDto>) convenientService.getAllConvenient();
    }

    @PostMapping()
    public ResponseEntity<ConvenientResponseDto> createConvenient(
            @Valid @RequestBody CreateConvenientRequestDto requestDto) {
        ConvenientResponseDto responseDto = convenientService.createConvenient(requestDto);
        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConvenient(@PathVariable("id") Long id) {
        convenientService.deleteConvenient(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/room/{roomId}/convenients")
    public List<ConvenientResponseDto> getConvenientByRoomId(@PathVariable("roomId") UUID id) {
        return convenientService.getConvenientByRoomId(id);
    }

}