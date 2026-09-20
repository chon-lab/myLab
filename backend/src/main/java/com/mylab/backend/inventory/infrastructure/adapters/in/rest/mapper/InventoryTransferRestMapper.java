package com.mylab.backend.inventory.infrastructure.adapters.in.rest.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.CreateInventoryTransferInput;
import com.mylab.backend.inventory.application.dto.CreateInventoryTransferItemInput;
import com.mylab.backend.inventory.application.dto.ReverseInventoryTransferInput;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.CreateInventoryTransferItemRequest;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.CreateInventoryTransferRequest;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.ReverseInventoryTransferRequest;

@Component
@RequiredArgsConstructor
public class InventoryTransferRestMapper {
    public CreateInventoryTransferInput toInput(CreateInventoryTransferRequest request) {
        List<CreateInventoryTransferItemInput> items = request.getItems().stream()
                .map(this::toInput)
                .toList();
        return new CreateInventoryTransferInput(
                request.getSourceLaboratoryId(),
                request.getDestinationLaboratoryId(),
                request.getTransferredAt(),
                request.getNotes(),
                items
        );
    }

    private CreateInventoryTransferItemInput toInput(CreateInventoryTransferItemRequest request) {
        return new CreateInventoryTransferItemInput(
                request.getInventoryItemId(),
                request.getQuantity()
        );
    }

    public ReverseInventoryTransferInput toInput(ReverseInventoryTransferRequest request) {
        if (request == null) {
            return null;
        }
        return new ReverseInventoryTransferInput(request.getReason());
    }
}

