package com.mylab.backend.inventory.infrastructure.adapters.in.rest.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.CreateInventoryEntryInput;
import com.mylab.backend.inventory.application.dto.CreateInventoryEntryItemInput;
import com.mylab.backend.inventory.application.dto.ReverseInventoryEntryInput;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.CreateInventoryEntryItemRequest;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.CreateInventoryEntryRequest;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.ReverseInventoryEntryRequest;

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
                request.getPurchaseType(),
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

    public ReverseInventoryEntryInput toInput(ReverseInventoryEntryRequest request) {
        if (request == null) {
            return null;
        }
        return new ReverseInventoryEntryInput(request.getReason());
    }
}
