package com.mylab.backend.inventory.infrastructure.adapters.out.persistence.mapper;

import java.util.ArrayList;

import org.springframework.stereotype.Component;

import com.mylab.backend.inventory.domain.model.InventoryMovement;
import com.mylab.backend.inventory.domain.model.InventoryMovementItem;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryMovementEntity;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryMovementItemEntity;

@Component
public class InventoryMovementMapper {
    public InventoryMovementEntity toEntity(InventoryMovement domain) {
        InventoryMovementEntity entity = InventoryMovementEntity.builder()
                .id(domain.id()).researchGroupId(domain.researchGroupId())
                .type(domain.type()).reason(domain.reason()).purchaseType(domain.purchaseType())
                .sourceLaboratoryId(domain.sourceLaboratoryId())
                .destinationLaboratoryId(domain.destinationLaboratoryId())
                .externalSourceName(domain.externalSourceName())
                .occurredAt(domain.occurredAt()).notes(domain.notes())
                .status(domain.status()).reversedAt(domain.reversedAt())
                .reversalReason(domain.reversalReason()).createdAt(domain.createdAt())
                .items(new ArrayList<>()).build();
        for (InventoryMovementItem item : domain.items()) {
            entity.getItems().add(InventoryMovementItemEntity.builder()
                    .id(item.id()).movement(entity).inventoryItemId(item.inventoryItemId())
                    .quantity(item.quantity()).unitCost(item.unitCost())
                    .batchNumber(item.batchNumber()).manufacturer(item.manufacturer())
                    .expirationDate(item.expirationDate()).build());
        }
        return entity;
    }

    public InventoryMovement toDomain(InventoryMovementEntity entity) {
        return new InventoryMovement(entity.getId(), entity.getResearchGroupId(), entity.getType(),
                entity.getReason(), entity.getPurchaseType(), entity.getSourceLaboratoryId(), entity.getDestinationLaboratoryId(),
                entity.getExternalSourceName(), entity.getOccurredAt(), entity.getNotes(),
                entity.getStatus(), entity.getReversedAt(), entity.getReversalReason(),
                entity.getCreatedAt(), entity.getItems().stream().map(item -> new InventoryMovementItem(
                        item.getId(), item.getInventoryItemId(), item.getQuantity(), item.getUnitCost(),
                        item.getBatchNumber(), item.getManufacturer(), item.getExpirationDate())).toList());
    }
}
