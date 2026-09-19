package com.mylab.backend.inventory.infrastructure.adapters.out.persistence.mapper;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.mylab.backend.inventory.domain.model.InventoryEntry;
import com.mylab.backend.inventory.domain.model.InventoryEntryItem;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryEntryEntity;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryEntryItemEntity;

@Component
public class InventoryEntryMapper {
    public InventoryEntryEntity toEntity(InventoryEntry domain) {
        InventoryEntryEntity entity = InventoryEntryEntity.builder()
                .id(domain.id())
                .researchGroupId(domain.researchGroupId())
                .laboratoryId(domain.laboratoryId())
                .source(domain.source())
                .sourceName(domain.sourceName())
                .receivedAt(domain.receivedAt())
                .notes(domain.notes())
                .status(domain.status())
                .reversedAt(domain.reversedAt())
                .reversalReason(domain.reversalReason())
                .createdAt(domain.createdAt())
                .items(new ArrayList<>())
                .build();

        List<InventoryEntryItemEntity> itemEntities = domain.items().stream()
                .map(item -> toEntity(item, entity))
                .toList();
        entity.setItems(new ArrayList<>(itemEntities));
        return entity;
    }

    private InventoryEntryItemEntity toEntity(
            InventoryEntryItem domain,
            InventoryEntryEntity inventoryEntry
    ) {
        return InventoryEntryItemEntity.builder()
                .id(domain.id())
                .inventoryEntry(inventoryEntry)
                .inventoryItemId(domain.inventoryItemId())
                .quantity(domain.quantity())
                .historicalUnitValue(domain.historicalUnitValue())
                .batchNumber(domain.batchNumber())
                .manufacturer(domain.manufacturer())
                .expirationDate(domain.expirationDate())
                .build();
    }
}
