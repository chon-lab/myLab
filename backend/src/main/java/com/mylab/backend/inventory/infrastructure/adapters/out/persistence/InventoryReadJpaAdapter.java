package com.mylab.backend.inventory.infrastructure.adapters.out.persistence;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
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
import com.mylab.backend.inventory.domain.model.InventoryItemType;
import com.mylab.backend.inventory.domain.model.InventoryTransferStatus;
import com.mylab.backend.inventory.domain.model.InventoryUnitOfMeasure;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryEntryEntity;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryEntryItemEntity;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryItemEntity;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryEntryJpaRepository;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryExitJpaRepository;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryExitStockProjection;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryItemJpaRepository;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryStockProjection;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryTransferJpaRepository;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryTransferStockProjection;

@Component
@RequiredArgsConstructor
public class InventoryReadJpaAdapter implements InventoryStockQueryPort, InventoryEntryQueryPort {
    private final InventoryEntryJpaRepository entryRepository;
    private final InventoryExitJpaRepository exitRepository;
    private final InventoryTransferJpaRepository transferRepository;
    private final InventoryItemJpaRepository itemRepository;

    @Override
    public List<InventoryStockItem> findStock(UUID researchGroupId, UUID laboratoryId) {
        Map<UUID, InventoryStockProjection> entryMap = entryRepository
                .findStock(researchGroupId, laboratoryId, InventoryEntryStatus.CONFIRMED)
                .stream()
                .collect(Collectors.toMap(InventoryStockProjection::getInventoryItemId, Function.identity()));

        Map<UUID, InventoryExitStockProjection> exitTotals = exitRepository
                .findExitTotals(researchGroupId, laboratoryId, InventoryExitStatus.CONFIRMED)
                .stream()
                .collect(Collectors.toMap(InventoryExitStockProjection::getInventoryItemId, Function.identity()));

        Map<UUID, InventoryTransferStockProjection> inwardTotals = laboratoryId != null
                ? transferRepository.findInwardTransferTotals(researchGroupId, laboratoryId, InventoryTransferStatus.CONFIRMED)
                        .stream()
                        .collect(Collectors.toMap(InventoryTransferStockProjection::getInventoryItemId, Function.identity()))
                : Collections.emptyMap();

        Map<UUID, InventoryTransferStockProjection> outwardTotals = laboratoryId != null
                ? transferRepository.findOutwardTransferTotals(researchGroupId, laboratoryId, InventoryTransferStatus.CONFIRMED)
                        .stream()
                        .collect(Collectors.toMap(InventoryTransferStockProjection::getInventoryItemId, Function.identity()))
                : Collections.emptyMap();

        Set<UUID> allItemIds = new LinkedHashSet<>();
        allItemIds.addAll(entryMap.keySet());
        allItemIds.addAll(exitTotals.keySet());
        allItemIds.addAll(inwardTotals.keySet());
        allItemIds.addAll(outwardTotals.keySet());

        Set<UUID> missingMetadataItemIds = allItemIds.stream()
                .filter(id -> !entryMap.containsKey(id))
                .collect(Collectors.toSet());

        Map<UUID, InventoryItemEntity> missingItemsMap = missingMetadataItemIds.isEmpty()
                ? Collections.emptyMap()
                : itemRepository.findAllById(missingMetadataItemIds)
                        .stream()
                        .collect(Collectors.toMap(InventoryItemEntity::getId, Function.identity()));

        List<InventoryStockItem> result = new ArrayList<>();
        for (UUID itemId : allItemIds) {
            InventoryStockProjection entry = entryMap.get(itemId);
            BigDecimal entryQty = entry != null && entry.getQuantity() != null ? entry.getQuantity() : BigDecimal.ZERO;
            BigDecimal entryVal = entry != null && entry.getTotalValue() != null ? entry.getTotalValue() : BigDecimal.ZERO;

            InventoryExitStockProjection exit = exitTotals.get(itemId);
            BigDecimal exitQty = exit != null && exit.getQuantity() != null ? exit.getQuantity() : BigDecimal.ZERO;
            BigDecimal exitVal = exit != null && exit.getTotalValue() != null ? exit.getTotalValue() : BigDecimal.ZERO;

            InventoryTransferStockProjection inward = inwardTotals.get(itemId);
            BigDecimal inwardQty = inward != null && inward.getQuantity() != null ? inward.getQuantity() : BigDecimal.ZERO;
            BigDecimal inwardVal = inward != null && inward.getTotalValue() != null ? inward.getTotalValue() : BigDecimal.ZERO;

            InventoryTransferStockProjection outward = outwardTotals.get(itemId);
            BigDecimal outwardQty = outward != null && outward.getQuantity() != null ? outward.getQuantity() : BigDecimal.ZERO;
            BigDecimal outwardVal = outward != null && outward.getTotalValue() != null ? outward.getTotalValue() : BigDecimal.ZERO;

            BigDecimal netQty = entryQty.add(inwardQty).subtract(outwardQty).subtract(exitQty);
            BigDecimal netVal = entryVal.add(inwardVal).subtract(outwardVal).subtract(exitVal);

            if (netQty.compareTo(BigDecimal.ZERO) > 0) {
                if (netVal.compareTo(BigDecimal.ZERO) < 0) {
                    netVal = BigDecimal.ZERO;
                }

                String itemName;
                InventoryItemType itemType;
                InventoryUnitOfMeasure unitOfMeasure;

                if (entry != null) {
                    itemName = entry.getItemName();
                    itemType = entry.getItemType();
                    unitOfMeasure = entry.getUnitOfMeasure();
                } else {
                    InventoryItemEntity itemEntity = missingItemsMap.get(itemId);
                    if (itemEntity != null) {
                        itemName = itemEntity.getName();
                        itemType = itemEntity.getItemType();
                        unitOfMeasure = itemEntity.getUnitOfMeasure();
                    } else {
                        itemName = itemId.toString();
                        itemType = null;
                        unitOfMeasure = null;
                    }
                }

                result.add(new InventoryStockItem(
                        itemId,
                        itemName,
                        itemType,
                        unitOfMeasure,
                        netQty,
                        netVal.setScale(2, RoundingMode.HALF_UP)
                ));
            }
        }

        result.sort(Comparator.comparing(InventoryStockItem::itemName, String.CASE_INSENSITIVE_ORDER));
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
