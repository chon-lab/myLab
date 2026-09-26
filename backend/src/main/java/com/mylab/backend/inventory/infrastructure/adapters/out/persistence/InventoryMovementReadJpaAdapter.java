package com.mylab.backend.inventory.infrastructure.adapters.out.persistence;

import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

import com.mylab.backend.inventory.application.dto.*;
import com.mylab.backend.inventory.application.port.out.InventoryMovementQueryPort;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryMovementEntity;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryMovementJpaRepository;

@Component
@RequiredArgsConstructor
public class InventoryMovementReadJpaAdapter implements InventoryMovementQueryPort {
    private final InventoryMovementJpaRepository repository;

    @Override
    public List<InventoryMovementHistoryRecord> findHistory(UUID groupId, InventoryMovementSearchCriteria criteria) {
        return repository.findGroupWithDetails(groupId).stream()
                .filter(m -> criteria.laboratoryId() == null
                        || criteria.laboratoryId().equals(m.getSourceLaboratoryId())
                        || criteria.laboratoryId().equals(m.getDestinationLaboratoryId()))
                .filter(m -> InventoryReadJpaAdapter.matchesItem(m, criteria.inventoryItemId()))
                .filter(m -> criteria.movementType() == null || criteria.movementType() == m.getType())
                .filter(m -> criteria.reason() == null || criteria.reason() == m.getReason())
                .filter(m -> criteria.status() == null || criteria.status() == m.getStatus())
                .filter(m -> InventoryReadJpaAdapter.matchesDates(m, criteria.dateFrom(), criteria.dateTo()))
                .map(this::toRecord).toList();
    }

    private InventoryMovementHistoryRecord toRecord(InventoryMovementEntity m) {
        return new InventoryMovementHistoryRecord(m.getId(), m.getResearchGroupId(), m.getType(), m.getReason(), m.getPurchaseType(),
                m.getSourceLaboratoryId(), m.getSourceLaboratory() == null ? null : m.getSourceLaboratory().getName(),
                m.getDestinationLaboratoryId(), m.getDestinationLaboratory() == null ? null : m.getDestinationLaboratory().getName(),
                m.getExternalSourceName(), m.getOccurredAt(), m.getNotes(), m.getStatus(), m.getReversedAt(),
                m.getReversalReason(), m.getCreatedAt(), m.getItems().stream().map(line -> new InventoryMovementHistoryItem(
                    line.getId(), line.getInventoryItemId(), line.getInventoryItem().getName(),
                    line.getQuantity(), line.getUnitCost(), line.getQuantity().multiply(line.getUnitCost())
                    .setScale(2, RoundingMode.HALF_UP), line.getBatchNumber(), line.getManufacturer(),
                    line.getExpirationDate())).toList());
    }
}
