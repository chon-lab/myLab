package com.mylab.backend.inventory.infrastructure.adapters.out.persistence;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.InventoryEntryHistoryItem;
import com.mylab.backend.inventory.application.dto.InventoryEntryHistoryRecord;
import com.mylab.backend.inventory.application.dto.InventoryEntrySearchCriteria;
import com.mylab.backend.inventory.application.dto.InventoryStockItem;
import com.mylab.backend.inventory.application.port.out.InventoryEntryQueryPort;
import com.mylab.backend.inventory.application.port.out.InventoryStockQueryPort;
import com.mylab.backend.inventory.domain.model.InventoryEntryStatus;
import com.mylab.backend.inventory.domain.model.InventoryExitStatus;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryEntryEntity;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryEntryItemEntity;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryEntryJpaRepository;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryExitJpaRepository;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryExitStockProjection;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryStockProjection;

@Component
@RequiredArgsConstructor
public class InventoryReadJpaAdapter implements InventoryStockQueryPort, InventoryEntryQueryPort {
    private final InventoryEntryJpaRepository entryRepository;
    private final InventoryExitJpaRepository exitRepository;

    @Override
    public List<InventoryStockItem> findStock(UUID researchGroupId, UUID laboratoryId) {
        List<InventoryStockProjection> entries = entryRepository.findStock(
                researchGroupId, laboratoryId, InventoryEntryStatus.CONFIRMED
        );
        Map<UUID, InventoryExitStockProjection> exitTotals = exitRepository.findExitTotals(
                researchGroupId, laboratoryId, InventoryExitStatus.CONFIRMED
        ).stream().collect(Collectors.toMap(
                InventoryExitStockProjection::getInventoryItemId,
                Function.identity()
        ));

        List<InventoryStockItem> result = new ArrayList<>();
        for (InventoryStockProjection entry : entries) {
            UUID itemId = entry.getInventoryItemId();
            BigDecimal entryQty = entry.getQuantity() != null ? entry.getQuantity() : BigDecimal.ZERO;
            BigDecimal entryVal = entry.getTotalValue() != null ? entry.getTotalValue() : BigDecimal.ZERO;

            InventoryExitStockProjection exitTotal = exitTotals.get(itemId);
            BigDecimal exitQty = exitTotal != null && exitTotal.getQuantity() != null ? exitTotal.getQuantity() : BigDecimal.ZERO;
            BigDecimal exitVal = exitTotal != null && exitTotal.getTotalValue() != null ? exitTotal.getTotalValue() : BigDecimal.ZERO;

            BigDecimal netQty = entryQty.subtract(exitQty);
            BigDecimal netVal = entryVal.subtract(exitVal);

            if (netQty.compareTo(BigDecimal.ZERO) > 0) {
                if (netVal.compareTo(BigDecimal.ZERO) < 0) {
                    netVal = BigDecimal.ZERO;
                }
                result.add(new InventoryStockItem(
                        itemId,
                        entry.getItemName(),
                        entry.getItemType(),
                        entry.getUnitOfMeasure(),
                        netQty,
                        netVal.setScale(2, RoundingMode.HALF_UP)
                ));
            }
        }
        return result;
    }

    @Override
    public List<InventoryEntryHistoryRecord> findHistory(
            UUID researchGroupId,
            InventoryEntrySearchCriteria criteria
    ) {
        return entryRepository.searchHistory(
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
        return entryRepository.findByIdWithDetails(id).map(this::toHistoryRecord);
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
