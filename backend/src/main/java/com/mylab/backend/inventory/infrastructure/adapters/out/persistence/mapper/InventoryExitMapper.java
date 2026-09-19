package com.mylab.backend.inventory.infrastructure.adapters.out.persistence.mapper;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.mylab.backend.inventory.domain.model.InventoryExit;
import com.mylab.backend.inventory.domain.model.InventoryExitItem;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryExitEntity;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryExitItemEntity;

@Component
public class InventoryExitMapper {
    public InventoryExitEntity toEntity(InventoryExit domain) {
        if (domain == null) {
            return null;
        }

        InventoryExitEntity entity = InventoryExitEntity.builder()
                .id(domain.id())
                .researchGroupId(domain.researchGroupId())
                .laboratoryId(domain.laboratoryId())
                .type(domain.type())
                .occurredAt(domain.occurredAt())
                .notes(domain.notes())
                .status(domain.status())
                .reversedAt(domain.reversedAt())
                .reversalReason(domain.reversalReason())
                .createdAt(domain.createdAt())
                .items(new ArrayList<>())
                .build();

        List<InventoryExitItemEntity> itemEntities = domain.items().stream()
                .map(item -> toEntity(item, entity))
                .toList();
        entity.setItems(new ArrayList<>(itemEntities));
        return entity;
    }

    private InventoryExitItemEntity toEntity(
            InventoryExitItem domain,
            InventoryExitEntity inventoryExit
    ) {
        return InventoryExitItemEntity.builder()
                .id(domain.id())
                .inventoryExit(inventoryExit)
                .inventoryItemId(domain.inventoryItemId())
                .quantity(domain.quantity())
                .unitCost(domain.unitCost())
                .build();
    }

    public InventoryExit toDomain(InventoryExitEntity entity) {
        if (entity == null) {
            return null;
        }

        List<InventoryExitItem> items = entity.getItems() == null ? List.of() : entity.getItems().stream()
                .map(this::toDomain)
                .toList();

        return new InventoryExit(
                entity.getId(),
                entity.getResearchGroupId(),
                entity.getLaboratoryId(),
                entity.getType(),
                entity.getOccurredAt(),
                entity.getNotes(),
                entity.getStatus(),
                entity.getReversedAt(),
                entity.getReversalReason(),
                entity.getCreatedAt(),
                items
        );
    }

    private InventoryExitItem toDomain(InventoryExitItemEntity entity) {
        if (entity == null) {
            return null;
        }

        return new InventoryExitItem(
                entity.getId(),
                entity.getInventoryItemId(),
                entity.getQuantity(),
                entity.getUnitCost()
        );
    }
}

