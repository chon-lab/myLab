package com.mylab.backend.inventory.infrastructure.adapters.out.persistence;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.InventoryTransferHistoryItem;
import com.mylab.backend.inventory.application.dto.InventoryTransferHistoryRecord;
import com.mylab.backend.inventory.application.dto.InventoryTransferSearchCriteria;
import com.mylab.backend.inventory.application.port.out.InventoryTransferQueryPort;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryTransferEntity;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryTransferItemEntity;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryTransferJpaRepository;

@Component
@RequiredArgsConstructor
public class InventoryTransferReadJpaAdapter implements InventoryTransferQueryPort {
    private final InventoryTransferJpaRepository transferRepository;

    @Override
    public List<InventoryTransferHistoryRecord> findHistory(
            UUID researchGroupId,
            InventoryTransferSearchCriteria criteria
    ) {
        return transferRepository.searchHistory(
                        researchGroupId,
                        criteria.sourceLaboratoryId(),
                        criteria.destinationLaboratoryId(),
                        criteria.inventoryItemId(),
                        criteria.dateFrom(),
                        criteria.dateTo()
                )
                .stream()
                .map(this::toTransferHistoryRecord)
                .toList();
    }

    @Override
    public Optional<InventoryTransferHistoryRecord> findById(UUID id) {
        return transferRepository.findByIdWithDetails(id).map(this::toTransferHistoryRecord);
    }

    private InventoryTransferHistoryRecord toTransferHistoryRecord(InventoryTransferEntity transfer) {
        List<InventoryTransferHistoryItem> items = transfer.getItems().stream()
                .map(this::toTransferHistoryItem)
                .toList();
        return new InventoryTransferHistoryRecord(
                transfer.getId(),
                transfer.getResearchGroupId(),
                transfer.getSourceLaboratoryId(),
                transfer.getSourceLaboratory().getName(),
                transfer.getDestinationLaboratoryId(),
                transfer.getDestinationLaboratory().getName(),
                transfer.getTransferredAt(),
                transfer.getNotes(),
                transfer.getStatus(),
                transfer.getReversedAt(),
                transfer.getReversalReason(),
                transfer.getCreatedAt(),
                items
        );
    }

    private InventoryTransferHistoryItem toTransferHistoryItem(InventoryTransferItemEntity item) {
        BigDecimal totalCost = item.getQuantity() != null && item.getUnitCost() != null
                ? item.getQuantity().multiply(item.getUnitCost()).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        return new InventoryTransferHistoryItem(
                item.getId(),
                item.getInventoryItemId(),
                item.getInventoryItem().getName(),
                item.getInventoryItem().getItemType(),
                item.getInventoryItem().getUnitOfMeasure(),
                item.getQuantity(),
                item.getUnitCost(),
                totalCost
        );
    }
}

