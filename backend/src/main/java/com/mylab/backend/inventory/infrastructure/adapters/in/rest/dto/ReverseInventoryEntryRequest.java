package com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReverseInventoryEntryRequest {
    @NotBlank(message = "reason must not be blank")
    @Size(max = 2000, message = "reason must not exceed 2000 characters")
    private String reason;
}

