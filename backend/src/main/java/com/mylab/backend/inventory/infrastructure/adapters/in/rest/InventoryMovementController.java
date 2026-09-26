package com.mylab.backend.inventory.infrastructure.adapters.in.rest;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import com.mylab.backend.inventory.application.dto.*;
import com.mylab.backend.inventory.application.port.in.GetInventoryMovementHistoryPort;
import com.mylab.backend.inventory.domain.model.*;

@RestController
@RequiredArgsConstructor
public class InventoryMovementController {
    private final GetInventoryMovementHistoryPort usecase;

    @GetMapping("/api/v1/research-groups/{groupId}/inventory/movements")
    public List<InventoryMovementHistoryRecord> getHistory(@PathVariable UUID groupId,
            @RequestParam(required = false) UUID laboratoryId,
            @RequestParam(required = false) UUID inventoryItemId,
            @RequestParam(required = false) InventoryMovementType movementType,
            @RequestParam(required = false) InventoryMovementReason reason,
            @RequestParam(required = false) InventoryMovementStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return usecase.getHistory(groupId, new InventoryMovementSearchCriteria(laboratoryId, inventoryItemId,
                movementType, reason, status, dateFrom, dateTo));
    }
}
