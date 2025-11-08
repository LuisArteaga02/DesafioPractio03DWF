package com.udb.desafio2.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UserRequestDTO {
    @NotBlank(message = "Name is mandatory")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Email is mandatory")
    @Email(message = "Email must be valid")
    @Size(max = 150, message = "Email must be less than 150 characters")
    private String email;
}