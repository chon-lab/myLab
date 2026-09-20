package com.mylab.backend.inventory.application.usecase;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.CreateInventoryExitInput;
import com.mylab.backend.inventory.application.dto.CreateInventoryExitItemInput;
import com.mylab.backend.inventory.application.dto.InventoryStockItem;
import com.mylab.backend.inventory.application.exception.InventoryItemNotFoundException;
import com.mylab.backend.inventory.application.exception.InventoryLaboratoryNotFoundException;
import com.mylab.backend.inventory.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.inventory.application.port.in.CreateInventoryExitPort;
import com.mylab.backend.inventory.application.port.out.InventoryExitRepositoryPort;
import com.mylab.backend.inventory.application.port.out.InventoryItemRepositoryPort;
import com.mylab.backend.inventory.application.port.out.InventoryLaboratoryLookupPort;
import com.mylab.backend.inventory.application.port.out.InventoryStockQueryPort;
import com.mylab.backend.inventory.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;
import com.mylab.backend.inventory.domain.model.InventoryExit;
import com.mylab.backend.inventory.domain.model.InventoryExitItem;
import com.mylab.backend.inventory.domain.model.InventoryExitStatus;
import com.mylab.backend.inventory.domain.model.InventoryItem;

@Service
@RequiredArgsConstructor
public class CreateInventoryExitUsecase implements CreateInventoryExitPort {
    private final InventoryExitRepositoryPort exitRepository;
    private final InventoryItemRepositoryPort itemRepository;
    private final ResearchGroupLookupPort researchGroupLookup;
    private final InventoryLaboratoryLookupPort laboratoryLookup;
    private final InventoryStockQueryPort stockQuery;

    @Override
    @Transactional
    public UUID create(UUID researchGroupId, CreateInventoryExitInput input) {
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

        if (input.type() == null) {
            throw new InvalidInventoryException("exit type must not be null");
        }
        if (input.occurredAt() == null) {
            throw new InvalidInventoryException("occurredAt must not be null");
        }
        if (input.items() == null || input.items().isEmpty()) {
            throw new InvalidInventoryException("At least one exit item is required");
        }

        Map<UUID, InventoryStockItem> stockMap = stockQuery.findStock(researchGroupId, input.laboratoryId())
                .stream()
                .collect(Collectors.toMap(InventoryStockItem::inventoryItemId, Function.identity()));

        Set<UUID> selectedItemIds = new HashSet<>();
        List<InventoryExitItem> exitItems = new ArrayList<>();
        for (CreateInventoryExitItemInput line : input.items()) {
            if (line == null || line.inventoryItemId() == null) {
                throw new InvalidInventoryException("Every exit line must reference an inventory item");
            }
            if (!selectedItemIds.add(line.inventoryItemId())) {
                throw new InvalidInventoryException("An inventory item can only appear once per exit");
            }

            InventoryItem item = itemRepository.findById(line.inventoryItemId())
                    .filter(candidate -> candidate.getResearchGroupId().equals(researchGroupId))
                    .filter(InventoryItem::isActive)
                    .orElseThrow(() -> new InventoryItemNotFoundException(line.inventoryItemId()));

            validateQuantityForUnit(line, item);

            InventoryStockItem currentStock = stockMap.get(line.inventoryItemId());
            if (currentStock == null || currentStock.quantity().compareTo(BigDecimal.ZERO) <= 0) {
                throw new InvalidInventoryException(
                        "Insufficient stock for item '" + item.getName() + "'. Available: 0, requested: " + line.quantity()
                );
            }
            if (currentStock.quantity().compareTo(line.quantity()) < 0) {
                throw new InvalidInventoryException(
                        "Insufficient stock for item '" + item.getName() + "'. Available: " + currentStock.quantity() + ", requested: " + line.quantity()
                );
            }

            BigDecimal unitCost = currentStock.totalValue().divide(currentStock.quantity(), 2, RoundingMode.HALF_UP);
            if (unitCost.compareTo(BigDecimal.ZERO) <= 0) {
                unitCost = new BigDecimal("0.01");
            }

            exitItems.add(new InventoryExitItem(
                    UUID.randomUUID(),
                    line.inventoryItemId(),
                    line.quantity(),
                    unitCost
            ));
        }

        InventoryExit exit = new InventoryExit(
                UUID.randomUUID(),
                researchGroupId,
                input.laboratoryId(),
                input.type(),
                input.occurredAt(),
                input.notes(),
                InventoryExitStatus.CONFIRMED,
                null,
                null,
                LocalDateTime.now(),
                exitItems
        );

        exitRepository.save(exit);
        return exit.id();
    }

    private void validateQuantityForUnit(CreateInventoryExitItemInput line, InventoryItem item) {
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
    }
}

