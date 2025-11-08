package com.udb.desafio2.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponseDTO {
    private String token;
    private String type;
    private String email;
    private String name;
    private String role;

    public LoginResponseDTO(String token, String email, String name, String role) {
        this.token = token;
        this.type = "Bearer";
        this.email = email;
        this.name = name;
        this.role = role;
    }
}