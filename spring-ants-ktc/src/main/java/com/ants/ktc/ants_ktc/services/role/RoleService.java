package com.ants.ktc.ants_ktc.services.role;

// import java.util.List;
// import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// import com.ants.ktc.ants_ktc.dtos.role.RoleResponseDto;
import com.ants.ktc.ants_ktc.repositories.role.RoleRepository;

@Service
public class RoleService {
    @Autowired
    private RoleRepository roleRepository;

    // public List<RoleResponseDto> getAllRoles() {
    //     return roleRepository.findAll().stream()
    //             .map(role -> new RoleResponseDto(role.getRoleId(), role.getCode(), role.getName()))
    //             .collect(Collectors.toList());
    // }
    // public List<RoleResponseDto> getAllRoles() {
        // return roleRepository.findAll().stream()
                // .map(role -> new RoleResponseDto(role.getRoleId(), role.getCode(), role.getName()))
                // .collect(Collectors.toList());
    // }
}
