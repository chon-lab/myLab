package com.mylab.backend.inventory.infrastructure.adapters.out.persistence;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.InventoryExitHistoryItem;
import com.mylab.backend.inventory.application.dto.InventoryExitHistoryRecord;
import com.mylab.backend.inventory.application.dto.InventoryExitSearchCriteria;
import com.mylab.backend.inventory.application.port.out.InventoryExitQueryPort;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryExitEntity;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryExitItemEntity;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryExitJpaRepository;

@Component
@RequiredArgsConstructor
public class InventoryExitReadJpaAdapter implements InventoryExitQueryPort {
    private final InventoryExitJpaRepository exitRepository;

    @Override
    public List<InventoryExitHistoryRecord> findHistory(
            UUID researchGroupId,
            InventoryExitSearchCriteria criteria
    ) {
        return exitRepository.searchHistory(
                        researchGroupId,
                        criteria.laboratoryId(),
                        criteria.type(),
                        criteria.inventoryItemId(),
                        criteria.dateFrom(),
                        criteria.dateTo()
                )
                .stream()
                .map(this::toExitHistoryRecord)
                .toList();
    }

    @Override
    public Optional<InventoryExitHistoryRecord> findById(UUID id) {
        return exitRepository.findByIdWithDetails(id).map(this::toExitHistoryRecord);
    }

    private InventoryExitHistoryRecord toExitHistoryRecord(InventoryExitEntity exit) {
        List<InventoryExitHistoryItem> items = exit.getItems().stream()
                .map(this::toExitHistoryItem)
                .toList();
        return new InventoryExitHistoryRecord(
                exit.getId(),
                exit.getResearchGroupId(),
                exit.getLaboratoryId(),
                exit.getLaboratory().getName(),
                exit.getType(),
                exit.getOccurredAt(),
                exit.getNotes(),
                exit.getStatus(),
                exit.getReversedAt(),
                exit.getReversalReason(),
                exit.getCreatedAt(),
                items
        );
    }

    private InventoryExitHistoryItem toExitHistoryItem(InventoryExitItemEntity item) {
        BigDecimal totalCost = item.getQuantity() != null && item.getUnitCost() != null
                ? item.getQuantity().multiply(item.getUnitCost()).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        return new InventoryExitHistoryItem(
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

