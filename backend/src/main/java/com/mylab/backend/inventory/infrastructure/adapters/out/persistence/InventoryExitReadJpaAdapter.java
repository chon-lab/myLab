package com.mylab.backend.inventory.infrastructure.adapters.out.persistence;

import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.*;
import com.mylab.backend.inventory.application.port.out.InventoryExitQueryPort;
import com.mylab.backend.inventory.domain.model.*;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.*;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryMovementJpaRepository;

@Component
@RequiredArgsConstructor
public class InventoryExitReadJpaAdapter implements InventoryExitQueryPort {
    private final InventoryMovementJpaRepository repository;

    @Override
    public List<InventoryExitHistoryRecord> findHistory(UUID groupId, InventoryExitSearchCriteria criteria) {
        return repository.findGroupWithDetails(groupId).stream().filter(m -> m.getType() == InventoryMovementType.EXIT)
                .filter(m -> criteria.laboratoryId() == null || criteria.laboratoryId().equals(m.getSourceLaboratoryId()))
                .filter(m -> criteria.type() == null || criteria.type().name().equals(m.getReason().name()))
                .filter(m -> InventoryReadJpaAdapter.matchesItem(m, criteria.inventoryItemId()))
                .filter(m -> InventoryReadJpaAdapter.matchesDates(m, criteria.dateFrom(), criteria.dateTo()))
                .map(this::toRecord).toList();
    }

    @Override
    public Optional<InventoryExitHistoryRecord> findById(UUID id) {
        return repository.findByIdWithDetails(id).filter(m -> m.getType() == InventoryMovementType.EXIT)
                .map(this::toRecord);
    }

    private InventoryExitHistoryRecord toRecord(InventoryMovementEntity m) {
        return new InventoryExitHistoryRecord(m.getId(), m.getResearchGroupId(), m.getSourceLaboratoryId(),
                m.getSourceLaboratory().getName(), InventoryExitType.valueOf(m.getReason().name()),
                m.getOccurredAt(), m.getNotes(), InventoryExitStatus.valueOf(m.getStatus().name()),
                m.getReversedAt(), m.getReversalReason(), m.getCreatedAt(),
                m.getItems().stream().map(line -> new InventoryExitHistoryItem(
                    line.getId(), line.getInventoryItemId(), line.getInventoryItem().getName(),
                    line.getInventoryItem().getItemType(), line.getInventoryItem().getUnitOfMeasure(),
                    line.getQuantity(), line.getUnitCost(), line.getQuantity().multiply(line.getUnitCost())
                    .setScale(2, RoundingMode.HALF_UP))).toList());
    }
}
