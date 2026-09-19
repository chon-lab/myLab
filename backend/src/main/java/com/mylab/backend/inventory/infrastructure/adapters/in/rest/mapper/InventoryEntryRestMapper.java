package com.mylab.backend.inventory.infrastructure.adapters.in.rest.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.CreateInventoryEntryInput;
import com.mylab.backend.inventory.application.dto.CreateInventoryEntryItemInput;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.CreateInventoryEntryItemRequest;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.CreateInventoryEntryRequest;

@Component
@RequiredArgsConstructor
public class InventoryEntryRestMapper {
    public CreateInventoryEntryInput toInput(CreateInventoryEntryRequest request) {
        List<CreateInventoryEntryItemInput> items = request.getItems().stream()
                .map(this::toInput)
                .toList();
        return new CreateInventoryEntryInput(
                request.getLaboratoryId(),
                request.getSource(),
                request.getSourceName(),
                request.getReceivedAt(),
                request.getNotes(),
                items
        );
    }

    private CreateInventoryEntryItemInput toInput(CreateInventoryEntryItemRequest request) {
        return new CreateInventoryEntryItemInput(
                request.getInventoryItemId(),
                request.getQuantity(),
                request.getHistoricalUnitValue(),
                request.getBatchNumber(),
                request.getManufacturer(),
                request.getExpirationDate()
        );
    }
}
