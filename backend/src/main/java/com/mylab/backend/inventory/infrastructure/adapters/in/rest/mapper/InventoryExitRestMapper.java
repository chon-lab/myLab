package com.mylab.backend.inventory.infrastructure.adapters.in.rest.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.CreateInventoryExitInput;
import com.mylab.backend.inventory.application.dto.CreateInventoryExitItemInput;
import com.mylab.backend.inventory.application.dto.ReverseInventoryExitInput;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.CreateInventoryExitItemRequest;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.CreateInventoryExitRequest;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.ReverseInventoryExitRequest;

@Component
@RequiredArgsConstructor
public class InventoryExitRestMapper {
    public CreateInventoryExitInput toInput(CreateInventoryExitRequest request) {
        List<CreateInventoryExitItemInput> items = request.getItems().stream()
                .map(this::toInput)
                .toList();
        return new CreateInventoryExitInput(
                request.getLaboratoryId(),
                request.getType(),
                request.getOccurredAt(),
                request.getNotes(),
                items
        );
    }

    private CreateInventoryExitItemInput toInput(CreateInventoryExitItemRequest request) {
        return new CreateInventoryExitItemInput(
                request.getInventoryItemId(),
                request.getQuantity()
        );
    }

    public ReverseInventoryExitInput toInput(ReverseInventoryExitRequest request) {
        if (request == null) {
            return null;
        }
        return new ReverseInventoryExitInput(request.getReason());
    }
}

