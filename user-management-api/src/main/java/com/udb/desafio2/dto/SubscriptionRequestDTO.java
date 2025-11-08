package com.udb.desafio2.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class SubscriptionRequestDTO {
    @NotBlank(message = "Type is mandatory")
    @Size(min = 2, max = 50, message = "Type must be between 2 and 50 characters")
    private String type;

    @NotNull(message = "Start date is mandatory")
    @FutureOrPresent(message = "Start date must be today or in the future")
    private LocalDate startDate;

    @NotNull(message = "End date is mandatory")
    @Future(message = "End date must be in the future")
    private LocalDate endDate;

    @NotNull(message = "User ID is mandatory")
    private Long userId;
}