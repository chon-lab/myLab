package com.mylab.backend.inventory.infrastructure.adapters.in.rest;

import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.InventoryStockResponse;
import com.mylab.backend.inventory.application.port.in.GetInventoryStockPort;

@RestController
@RequiredArgsConstructor
public class InventoryStockController {
    private final GetInventoryStockPort getInventoryStockPort;

    @GetMapping("/api/v1/research-groups/{groupId}/inventory/stock")
    public InventoryStockResponse getStock(
            @PathVariable UUID groupId,
            @RequestParam(required = false) UUID laboratoryId
    ) {
        return getInventoryStockPort.getStock(groupId, laboratoryId);
    }
}
