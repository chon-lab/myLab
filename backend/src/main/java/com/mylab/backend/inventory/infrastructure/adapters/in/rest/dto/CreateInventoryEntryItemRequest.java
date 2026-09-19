package com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreateInventoryEntryItemRequest {
    @NotNull
    private UUID inventoryItemId;

    @NotNull
    @DecimalMin(value = "0", inclusive = false)
    @Digits(integer = 11, fraction = 4)
    private BigDecimal quantity;

    @NotNull
    @DecimalMin(value = "0", inclusive = false)
    @Digits(integer = 13, fraction = 2)
    private BigDecimal historicalUnitValue;

    @Size(max = 100)
    private String batchNumber;

    @Size(max = 255)
    private String manufacturer;

    private LocalDate expirationDate;
}
