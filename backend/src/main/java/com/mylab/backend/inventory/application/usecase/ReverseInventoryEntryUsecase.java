package com.mylab.backend.inventory.application.usecase;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.ReverseInventoryEntryInput;
import com.mylab.backend.inventory.application.exception.InventoryEntryNotFoundException;
import com.mylab.backend.inventory.application.port.in.ReverseInventoryEntryPort;
import com.mylab.backend.inventory.application.port.out.InventoryMovementRepositoryPort;
import com.mylab.backend.inventory.application.port.out.InventoryStockQueryPort;
import com.mylab.backend.inventory.application.port.out.InventoryLaboratoryLookupPort;
import com.mylab.backend.inventory.application.dto.InventoryStockItem;
import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;
import com.mylab.backend.inventory.domain.model.InventoryMovement;
import com.mylab.backend.inventory.domain.model.InventoryMovementType;

@Service
@RequiredArgsConstructor
public class ReverseInventoryEntryUsecase implements ReverseInventoryEntryPort {
    private final InventoryMovementRepositoryPort movementRepository;
    private final InventoryStockQueryPort stockQuery;
    private final InventoryLaboratoryLookupPort laboratoryLookup;

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void reverse(UUID entryId, ReverseInventoryEntryInput input) {
        Objects.requireNonNull(entryId, "entryId must not be null");
        if (input == null || input.reason() == null || input.reason().isBlank()) {
            throw new InvalidInventoryException("reversal reason must not be blank");
        }

        InventoryMovement entry = movementRepository.findByIdForUpdate(entryId)
                .filter(candidate -> candidate.type() == InventoryMovementType.ENTRY)
                .orElseThrow(() -> new InventoryEntryNotFoundException(entryId));

        InventoryMovement reversed = entry.reverse(input.reason(), LocalDateTime.now());
        laboratoryLookup.lockForStockUpdate(entry.destinationLaboratoryId());
        Map<UUID, InventoryStockItem> stock = stockQuery.findStock(entry.researchGroupId(), entry.destinationLaboratoryId())
                .stream().collect(Collectors.toMap(InventoryStockItem::inventoryItemId, Function.identity()));
        entry.items().forEach(line -> {
            InventoryStockItem current = stock.get(line.inventoryItemId());
            if (current == null || current.quantity().compareTo(line.quantity()) < 0) {
                throw new InvalidInventoryException("Cannot reverse entry: insufficient stock in destination laboratory");
            }
        });
        movementRepository.save(reversed);
    }
}

