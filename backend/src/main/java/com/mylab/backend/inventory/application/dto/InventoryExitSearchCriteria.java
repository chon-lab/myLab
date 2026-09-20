package com.mylab.backend.inventory.application.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.mylab.backend.inventory.domain.model.InventoryExitType;

public record InventoryExitSearchCriteria(
        UUID laboratoryId,
        InventoryExitType type,
        UUID inventoryItemId,
        LocalDate dateFrom,
        LocalDate dateTo
) {}

