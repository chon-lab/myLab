package com.mylab.backend.inventory.infrastructure.adapters.in.rest.mapper;

import java.util.List;
import org.springframework.stereotype.Component;
import com.mylab.backend.inventory.application.dto.CreateInventoryItemInput;
import com.mylab.backend.inventory.application.dto.UpdateInventoryItemInput;
import com.mylab.backend.inventory.domain.model.InventoryItem;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.CreateInventoryItemRequest;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.InventoryItemResponse;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.UpdateInventoryItemRequest;
@Component
public class InventoryRestMapper {
    public CreateInventoryItemInput toInput(CreateInventoryItemRequest request) {
        return new CreateInventoryItemInput(
                request.getName(),
                request.getDescription(),
                request.getItemType(),
                request.getUnitOfMeasure(),
                request.getReferenceUnitValue()
        );
    }

    public UpdateInventoryItemInput toInput(UpdateInventoryItemRequest request) {
        return new UpdateInventoryItemInput(
                request.getName(),
                request.getDescription(),
                request.getReferenceUnitValue()
        );
    }

    public InventoryItemResponse toResponse(InventoryItem domain) {
        return new InventoryItemResponse(
                domain.getId(),
                domain.getResearchGroupId(),
                domain.getName(),
                domain.getDescription(),
                domain.getItemType().name(),
                domain.getUnitOfMeasure().name(),
                domain.getReferenceUnitValue(),
                domain.isActive(),
                domain.getCreatedAt(),
                domain.getUpdatedAt()
        );
    }

    public List<InventoryItemResponse> toItemResponses(List<InventoryItem> domains) {
        return domains.stream()
                .map(this::toResponse)
                .toList();
    }
}
