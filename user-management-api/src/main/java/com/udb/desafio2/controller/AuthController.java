package com.udb.desafio2.controller;

import com.udb.desafio2.dto.LoginRequestDTO;
import com.udb.desafio2.dto.LoginResponseDTO;
import com.udb.desafio2.dto.RegisterRequestDTO;
import com.udb.desafio2.entity.User;
import com.udb.desafio2.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication endpoints")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticate user and return JWT token")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        LoginResponseDTO response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @Operation(summary = "Register", description = "Register a new user")
    public ResponseEntity<User> register(@Valid @RequestBody RegisterRequestDTO registerRequest) {
        User user = authService.register(registerRequest);
        return ResponseEntity.ok(user);
    }
}