package com.udb.desafio2.dto;

public class LoginResponseDTO {
    private String token;
    private Long id;        // ← AGREGAR ESTE CAMPO
    private String email;
    private String name;
    private String role;

    // Constructor actualizado
    public LoginResponseDTO(String token, Long id, String email, String name, String role) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
    }

    // Getters y setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getId() { return id; }                    // ← AGREGAR
    public void setId(Long id) { this.id = id; }          // ← AGREGAR

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}