package com.mylab.backend.inventory.application.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.mylab.backend.inventory.domain.model.InventoryMovementReason;
import com.mylab.backend.inventory.domain.model.InventoryMovementStatus;
import com.mylab.backend.inventory.domain.model.InventoryMovementType;

public record InventoryMovementSearchCriteria(UUID laboratoryId, UUID inventoryItemId,
        InventoryMovementType movementType, InventoryMovementReason reason, InventoryMovementStatus status,
        LocalDate dateFrom, LocalDate dateTo) {}
