package com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class InventoryItemResponse {
    private UUID id;
    private UUID researchGroupId;
    private String name;
    private String description;
    private String itemType;
    private String unitOfMeasure;
    private BigDecimal referenceUnitValue;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
