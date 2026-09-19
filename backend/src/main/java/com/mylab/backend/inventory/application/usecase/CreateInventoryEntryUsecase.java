package com.mylab.backend.inventory.application.usecase;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.CreateInventoryEntryInput;
import com.mylab.backend.inventory.application.dto.CreateInventoryEntryItemInput;
import com.mylab.backend.inventory.application.exception.InventoryItemNotFoundException;
import com.mylab.backend.inventory.application.exception.InventoryLaboratoryNotFoundException;
import com.mylab.backend.inventory.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.inventory.application.port.in.CreateInventoryEntryPort;
import com.mylab.backend.inventory.application.port.out.InventoryEntryRepositoryPort;
import com.mylab.backend.inventory.application.port.out.InventoryItemRepositoryPort;
import com.mylab.backend.inventory.application.port.out.InventoryLaboratoryLookupPort;
import com.mylab.backend.inventory.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;
import com.mylab.backend.inventory.domain.model.InventoryEntry;
import com.mylab.backend.inventory.domain.model.InventoryEntryItem;
import com.mylab.backend.inventory.domain.model.InventoryEntryStatus;
import com.mylab.backend.inventory.domain.model.InventoryItem;

@Service
@RequiredArgsConstructor
public class CreateInventoryEntryUsecase implements CreateInventoryEntryPort {
    private final InventoryEntryRepositoryPort entryRepository;
    private final InventoryItemRepositoryPort itemRepository;
    private final ResearchGroupLookupPort researchGroupLookup;
    private final InventoryLaboratoryLookupPort laboratoryLookup;

    @Override
    @Transactional
    public UUID create(UUID researchGroupId, CreateInventoryEntryInput input) {
        Objects.requireNonNull(researchGroupId, "researchGroupId must not be null");
        Objects.requireNonNull(input, "input must not be null");

        if (!researchGroupLookup.existsById(researchGroupId)) {
            throw new ResearchGroupNotFoundException(researchGroupId);
        }
        if (input.laboratoryId() == null) {
            throw new InvalidInventoryException("laboratoryId must not be null");
        }

        UUID laboratoryResearchGroupId = laboratoryLookup
                .findResearchGroupIdByLaboratoryId(input.laboratoryId())
                .orElseThrow(() -> new InventoryLaboratoryNotFoundException(input.laboratoryId()));
        if (!researchGroupId.equals(laboratoryResearchGroupId)) {
            throw new InvalidInventoryException("laboratory must belong to the specified research group");
        }

        if (input.items() == null || input.items().isEmpty()) {
            throw new InvalidInventoryException("At least one entry item is required");
        }

        Set<UUID> selectedItemIds = new HashSet<>();
        List<InventoryEntryItem> entryItems = new ArrayList<>();
        for (CreateInventoryEntryItemInput line : input.items()) {
            if (line == null || line.inventoryItemId() == null) {
                throw new InvalidInventoryException("Every entry line must reference an inventory item");
            }
            if (!selectedItemIds.add(line.inventoryItemId())) {
                throw new InvalidInventoryException("An inventory item can only appear once per entry");
            }

            InventoryItem item = itemRepository.findById(line.inventoryItemId())
                    .filter(candidate -> candidate.getResearchGroupId().equals(researchGroupId))
                    .filter(InventoryItem::isActive)
                    .orElseThrow(() -> new InventoryItemNotFoundException(line.inventoryItemId()));

            validateQuantityForUnit(line, item);
            entryItems.add(toDomain(line));
        }

        InventoryEntry entry = new InventoryEntry(
                UUID.randomUUID(),
                researchGroupId,
                input.laboratoryId(),
                input.source(),
                input.sourceName(),
                input.receivedAt(),
                input.notes(),
                InventoryEntryStatus.CONFIRMED,
                null,
                null,
                LocalDateTime.now(),
                entryItems
        );

        entryRepository.save(entry);
        return entry.id();
    }

    private void validateQuantityForUnit(CreateInventoryEntryItemInput line, InventoryItem item) {
        if (line.quantity() == null || line.quantity().signum() <= 0) {
            throw new InvalidInventoryException("quantity must be greater than zero");
        }
        if (line.quantity().stripTrailingZeros().scale() > 4) {
            throw new InvalidInventoryException("quantity supports up to 4 decimal places");
        }
        if (!item.getUnitOfMeasure().allowsFractional()
                && line.quantity().stripTrailingZeros().scale() > 0) {
            throw new InvalidInventoryException(
                    "quantity must be an integer for unit " + item.getUnitOfMeasure()
            );
        }
        if (line.historicalUnitValue() == null || line.historicalUnitValue().signum() <= 0) {
            throw new InvalidInventoryException("historicalUnitValue must be greater than zero");
        }
        if (line.historicalUnitValue().stripTrailingZeros().scale() > 2) {
            throw new InvalidInventoryException("historicalUnitValue supports up to 2 decimal places");
        }
    }

    private InventoryEntryItem toDomain(CreateInventoryEntryItemInput line) {
        return new InventoryEntryItem(
                UUID.randomUUID(),
                line.inventoryItemId(),
                line.quantity(),
                line.historicalUnitValue(),
                line.batchNumber(),
                line.manufacturer(),
                line.expirationDate()
        );
    }
}
