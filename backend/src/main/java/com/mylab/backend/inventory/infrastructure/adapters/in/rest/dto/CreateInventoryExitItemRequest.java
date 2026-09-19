package com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateInventoryExitItemRequest {
    @NotNull
    private UUID inventoryItemId;

    @NotNull
    @DecimalMin(value = "0", inclusive = false)
    @Digits(integer = 11, fraction = 4)
    private BigDecimal quantity;
}

