package com.mylab.backend.inventory.infrastructure.adapters.out.persistence;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

import com.mylab.backend.inventory.application.dto.*;
import com.mylab.backend.inventory.application.port.out.InventoryEntryQueryPort;
import com.mylab.backend.inventory.application.port.out.InventoryStockQueryPort;
import com.mylab.backend.inventory.domain.model.*;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.*;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryMovementJpaRepository;

@Component
@RequiredArgsConstructor
public class InventoryReadJpaAdapter implements InventoryStockQueryPort, InventoryEntryQueryPort {
    private final InventoryMovementJpaRepository repository;

    @Override
    public List<InventoryStockItem> findStock(UUID researchGroupId, UUID laboratoryId) {
        Map<UUID, BigDecimal[]> totals = new HashMap<>();
        Map<UUID, InventoryItemEntity> items = new HashMap<>();
        for (InventoryMovementEntity movement : repository.findGroupWithDetails(researchGroupId)) {
            if (movement.getStatus() != InventoryMovementStatus.CONFIRMED) continue;
            int direction = laboratoryId == null
                    ? switch (movement.getType()) {
                        case ENTRY -> 1;
                        case EXIT -> -1;
                        case TRANSFER -> 0;
                    }
                    : (laboratoryId.equals(movement.getDestinationLaboratoryId()) ? 1 : 0)
                        - (laboratoryId.equals(movement.getSourceLaboratoryId()) ? 1 : 0);
            if (direction == 0) continue;
            for (InventoryMovementItemEntity line : movement.getItems()) {
                BigDecimal[] total = totals.computeIfAbsent(line.getInventoryItemId(),
                        ignored -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
                total[0] = total[0].add(line.getQuantity().multiply(BigDecimal.valueOf(direction)));
                total[1] = total[1].add(line.getQuantity().multiply(line.getUnitCost())
                        .multiply(BigDecimal.valueOf(direction)));
                items.put(line.getInventoryItemId(), line.getInventoryItem());
            }
        }
        List<InventoryStockItem> result = new ArrayList<>();
        totals.forEach((id, total) -> {
            if (total[0].signum() > 0) {
                InventoryItemEntity item = items.get(id);
                result.add(new InventoryStockItem(id, item.getName(), item.getItemType(),
                        item.getUnitOfMeasure(), total[0], total[1].max(BigDecimal.ZERO)
                        .setScale(2, RoundingMode.HALF_UP)));
            }
        });
        result.sort(Comparator.comparing(InventoryStockItem::itemName, String.CASE_INSENSITIVE_ORDER));
        return result;
    }

    @Override
    public List<InventoryEntryHistoryRecord> findHistory(UUID groupId, InventoryEntrySearchCriteria criteria) {
        return repository.findGroupWithDetails(groupId).stream().filter(m -> m.getType() == InventoryMovementType.ENTRY)
                .filter(m -> criteria.laboratoryId() == null || criteria.laboratoryId().equals(m.getDestinationLaboratoryId()))
                .filter(m -> criteria.source() == null || criteria.source().name().equals(m.getReason().name()))
                .filter(m -> matchesItem(m, criteria.inventoryItemId()))
                .filter(m -> matchesDates(m, criteria.dateFrom(), criteria.dateTo()))
                .map(this::entryRecord).toList();
    }

    @Override
    public Optional<InventoryEntryHistoryRecord> findById(UUID id) {
        return repository.findByIdWithDetails(id).filter(m -> m.getType() == InventoryMovementType.ENTRY)
                .map(this::entryRecord);
    }

    static boolean matchesItem(InventoryMovementEntity m, UUID itemId) {
        return itemId == null || m.getItems().stream().anyMatch(line -> itemId.equals(line.getInventoryItemId()));
    }

    static boolean matchesDates(InventoryMovementEntity m, LocalDate from, LocalDate to) {
        return (from == null || !m.getOccurredAt().isBefore(from))
                && (to == null || !m.getOccurredAt().isAfter(to));
    }

    private InventoryEntryHistoryRecord entryRecord(InventoryMovementEntity m) {
        return new InventoryEntryHistoryRecord(m.getId(), m.getResearchGroupId(), m.getDestinationLaboratoryId(),
                m.getDestinationLaboratory().getName(), InventoryEntrySource.valueOf(m.getReason().name()),
                m.getExternalSourceName(), m.getOccurredAt(), m.getNotes(),
                InventoryEntryStatus.valueOf(m.getStatus().name()), m.getReversedAt(), m.getReversalReason(),
                m.getCreatedAt(), m.getItems().stream().map(line -> new InventoryEntryHistoryItem(
                    line.getId(), line.getInventoryItemId(), line.getInventoryItem().getName(),
                    line.getInventoryItem().getItemType(), line.getInventoryItem().getUnitOfMeasure(),
                    line.getQuantity(), line.getUnitCost(), line.getBatchNumber(), line.getManufacturer(),
                    line.getExpirationDate())).toList());
    }
}
