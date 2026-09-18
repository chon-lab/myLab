package com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.mylab.backend.inventory.domain.model.InventoryItemType;
import com.mylab.backend.inventory.domain.model.InventoryUnitOfMeasure;
@Data
@NoArgsConstructor
public class CreateInventoryItemRequest {
    @NotBlank
    @Size(max = 255)
    private String name;

    @Size(max = 2000)
    private String description;

    @NotNull
    private InventoryItemType itemType;

    @NotNull
    private InventoryUnitOfMeasure unitOfMeasure;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal referenceUnitValue;
}
