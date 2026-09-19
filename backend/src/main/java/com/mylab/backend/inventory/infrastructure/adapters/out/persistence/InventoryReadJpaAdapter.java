package com.mylab.backend.inventory.infrastructure.adapters.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.InventoryEntryHistoryItem;
import com.mylab.backend.inventory.application.dto.InventoryEntryHistoryRecord;
import com.mylab.backend.inventory.application.dto.InventoryEntrySearchCriteria;
import com.mylab.backend.inventory.application.dto.InventoryStockItem;
import com.mylab.backend.inventory.application.port.out.InventoryEntryQueryPort;
import com.mylab.backend.inventory.application.port.out.InventoryStockQueryPort;
import com.mylab.backend.inventory.domain.model.InventoryEntryStatus;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryEntryEntity;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryEntryItemEntity;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryEntryJpaRepository;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryStockProjection;

@Component
@RequiredArgsConstructor
public class InventoryReadJpaAdapter implements InventoryStockQueryPort, InventoryEntryQueryPort {
    private final InventoryEntryJpaRepository repository;

    @Override
    public List<InventoryStockItem> findStock(UUID researchGroupId, UUID laboratoryId) {
        return repository.findStock(researchGroupId, laboratoryId, InventoryEntryStatus.CONFIRMED)
                .stream()
                .map(this::toStockItem)
                .toList();
    }

    @Override
    public List<InventoryEntryHistoryRecord> findHistory(
            UUID researchGroupId,
            InventoryEntrySearchCriteria criteria
    ) {
        return repository.searchHistory(
                        researchGroupId,
                        criteria.laboratoryId(),
                        criteria.source(),
                        criteria.inventoryItemId(),
                        criteria.dateFrom(),
                        criteria.dateTo()
                )
                .stream()
                .map(this::toHistoryRecord)
                .toList();
    }

    @Override
    public Optional<InventoryEntryHistoryRecord> findById(UUID id) {
        return repository.findByIdWithDetails(id).map(this::toHistoryRecord);
    }

    private InventoryStockItem toStockItem(InventoryStockProjection projection) {
        return new InventoryStockItem(
                projection.getInventoryItemId(),
                projection.getItemName(),
                projection.getItemType(),
                projection.getUnitOfMeasure(),
                projection.getQuantity(),
                projection.getTotalValue()
        );
    }

    private InventoryEntryHistoryRecord toHistoryRecord(InventoryEntryEntity entry) {
        List<InventoryEntryHistoryItem> items = entry.getItems().stream()
                .map(this::toHistoryItem)
                .toList();
        return new InventoryEntryHistoryRecord(
                entry.getId(),
                entry.getResearchGroupId(),
                entry.getLaboratoryId(),
                entry.getLaboratory().getName(),
                entry.getSource(),
                entry.getSourceName(),
                entry.getReceivedAt(),
                entry.getNotes(),
                entry.getStatus(),
                entry.getReversedAt(),
                entry.getReversalReason(),
                entry.getCreatedAt(),
                items
        );
    }

    private InventoryEntryHistoryItem toHistoryItem(InventoryEntryItemEntity item) {
        return new InventoryEntryHistoryItem(
                item.getId(),
                item.getInventoryItemId(),
                item.getInventoryItem().getName(),
                item.getInventoryItem().getItemType(),
                item.getInventoryItem().getUnitOfMeasure(),
                item.getQuantity(),
                item.getHistoricalUnitValue(),
                item.getBatchNumber(),
                item.getManufacturer(),
                item.getExpirationDate()
        );
    }
}
