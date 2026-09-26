package com.mylab.backend.inventory.infrastructure.adapters.out.persistence;

import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.*;
import com.mylab.backend.inventory.application.port.out.InventoryTransferQueryPort;
import com.mylab.backend.inventory.domain.model.*;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.*;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryMovementJpaRepository;

@Component
@RequiredArgsConstructor
public class InventoryTransferReadJpaAdapter implements InventoryTransferQueryPort {
    private final InventoryMovementJpaRepository repository;

    @Override
    public List<InventoryTransferHistoryRecord> findHistory(UUID groupId, InventoryTransferSearchCriteria criteria) {
        return repository.findGroupWithDetails(groupId).stream().filter(m -> m.getType() == InventoryMovementType.TRANSFER)
                .filter(m -> criteria.sourceLaboratoryId() == null || criteria.sourceLaboratoryId().equals(m.getSourceLaboratoryId()))
                .filter(m -> criteria.destinationLaboratoryId() == null || criteria.destinationLaboratoryId().equals(m.getDestinationLaboratoryId()))
                .filter(m -> InventoryReadJpaAdapter.matchesItem(m, criteria.inventoryItemId()))
                .filter(m -> InventoryReadJpaAdapter.matchesDates(m, criteria.dateFrom(), criteria.dateTo()))
                .map(this::toRecord).toList();
    }

    @Override
    public Optional<InventoryTransferHistoryRecord> findById(UUID id) {
        return repository.findByIdWithDetails(id).filter(m -> m.getType() == InventoryMovementType.TRANSFER)
                .map(this::toRecord);
    }

    private InventoryTransferHistoryRecord toRecord(InventoryMovementEntity m) {
        return new InventoryTransferHistoryRecord(m.getId(), m.getResearchGroupId(), m.getSourceLaboratoryId(),
                m.getSourceLaboratory().getName(), m.getDestinationLaboratoryId(),
                m.getDestinationLaboratory().getName(), m.getOccurredAt(), m.getNotes(),
                InventoryTransferStatus.valueOf(m.getStatus().name()), m.getReversedAt(), m.getReversalReason(),
                m.getCreatedAt(), m.getItems().stream().map(line -> new InventoryTransferHistoryItem(
                    line.getId(), line.getInventoryItemId(), line.getInventoryItem().getName(),
                    line.getInventoryItem().getItemType(), line.getInventoryItem().getUnitOfMeasure(),
                    line.getQuantity(), line.getUnitCost(), line.getQuantity().multiply(line.getUnitCost())
                    .setScale(2, RoundingMode.HALF_UP))).toList());
    }
}
