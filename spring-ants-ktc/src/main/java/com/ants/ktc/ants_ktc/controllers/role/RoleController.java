package com.ants.ktc.ants_ktc.controllers.role;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ants.ktc.ants_ktc.dtos.role.RoleResponseDto;
import com.ants.ktc.ants_ktc.services.role.RoleService;

@RestController
@RequestMapping("/api/roles")
public class RoleController {
    // @Autowired
    // private RoleService roleService;

    // @GetMapping
    // public ResponseEntity<List<RoleResponseDto>> getAllRoles() {
    // return ResponseEntity.ok(roleService.getAllRoles());
    // }
    // @GetMapping
    // public ResponseEntity<List<RoleResponseDto>> getAllRoles() {
    //     // return ResponseEntity.ok(roleService.getAllRoles());
    // }
}
