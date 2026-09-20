package com.mylab.backend.inventory.infrastructure.adapters.out.persistence.mapper;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.mylab.backend.inventory.domain.model.InventoryTransfer;
import com.mylab.backend.inventory.domain.model.InventoryTransferItem;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryTransferEntity;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryTransferItemEntity;

@Component
public class InventoryTransferMapper {
    public InventoryTransferEntity toEntity(InventoryTransfer domain) {
        if (domain == null) {
            return null;
        }

        InventoryTransferEntity entity = InventoryTransferEntity.builder()
                .id(domain.id())
                .researchGroupId(domain.researchGroupId())
                .sourceLaboratoryId(domain.sourceLaboratoryId())
                .destinationLaboratoryId(domain.destinationLaboratoryId())
                .transferredAt(domain.transferredAt())
                .notes(domain.notes())
                .status(domain.status())
                .reversedAt(domain.reversedAt())
                .reversalReason(domain.reversalReason())
                .createdAt(domain.createdAt())
                .items(new ArrayList<>())
                .build();

        List<InventoryTransferItemEntity> itemEntities = domain.items().stream()
                .map(item -> toEntity(item, entity))
                .toList();
        entity.setItems(new ArrayList<>(itemEntities));
        return entity;
    }

    private InventoryTransferItemEntity toEntity(
            InventoryTransferItem domain,
            InventoryTransferEntity inventoryTransfer
    ) {
        return InventoryTransferItemEntity.builder()
                .id(domain.id())
                .inventoryTransfer(inventoryTransfer)
                .inventoryItemId(domain.inventoryItemId())
                .quantity(domain.quantity())
                .unitCost(domain.unitCost())
                .build();
    }

    public InventoryTransfer toDomain(InventoryTransferEntity entity) {
        if (entity == null) {
            return null;
        }

        List<InventoryTransferItem> items = entity.getItems() == null ? List.of() : entity.getItems().stream()
                .map(this::toDomain)
                .toList();

        return new InventoryTransfer(
                entity.getId(),
                entity.getResearchGroupId(),
                entity.getSourceLaboratoryId(),
                entity.getDestinationLaboratoryId(),
                entity.getTransferredAt(),
                entity.getNotes(),
                entity.getStatus(),
                entity.getReversedAt(),
                entity.getReversalReason(),
                entity.getCreatedAt(),
                items
        );
    }

    private InventoryTransferItem toDomain(InventoryTransferItemEntity entity) {
        if (entity == null) {
            return null;
        }

        return new InventoryTransferItem(
                entity.getId(),
                entity.getInventoryItemId(),
                entity.getQuantity(),
                entity.getUnitCost()
        );
    }
}

