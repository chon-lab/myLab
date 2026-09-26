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
import org.springframework.transaction.annotation.Isolation;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.CreateInventoryTransferInput;
import com.mylab.backend.inventory.application.dto.CreateInventoryTransferItemInput;
import com.mylab.backend.inventory.application.dto.InventoryStockItem;
import com.mylab.backend.inventory.application.exception.InventoryItemNotFoundException;
import com.mylab.backend.inventory.application.exception.InventoryLaboratoryNotFoundException;
import com.mylab.backend.inventory.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.inventory.application.port.in.CreateInventoryTransferPort;
import com.mylab.backend.inventory.application.port.out.InventoryItemRepositoryPort;
import com.mylab.backend.inventory.application.port.out.InventoryLaboratoryLookupPort;
import com.mylab.backend.inventory.application.port.out.InventoryStockQueryPort;
import com.mylab.backend.inventory.application.port.out.InventoryMovementRepositoryPort;
import com.mylab.backend.inventory.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;
import com.mylab.backend.inventory.domain.model.InventoryItem;
import com.mylab.backend.inventory.domain.model.InventoryMovement;
import com.mylab.backend.inventory.domain.model.InventoryMovementItem;
import com.mylab.backend.inventory.domain.model.InventoryMovementType;
import com.mylab.backend.inventory.domain.model.InventoryMovementReason;
import com.mylab.backend.inventory.domain.model.InventoryMovementStatus;

@Service
@RequiredArgsConstructor
public class CreateInventoryTransferUsecase implements CreateInventoryTransferPort {
    private final InventoryMovementRepositoryPort movementRepository;
    private final InventoryItemRepositoryPort itemRepository;
    private final ResearchGroupLookupPort researchGroupLookup;
    private final InventoryLaboratoryLookupPort laboratoryLookup;
    private final InventoryStockQueryPort stockQuery;

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public UUID create(UUID researchGroupId, CreateInventoryTransferInput input) {
        Objects.requireNonNull(researchGroupId, "researchGroupId must not be null");
        Objects.requireNonNull(input, "input must not be null");

        if (!researchGroupLookup.existsById(researchGroupId)) {
            throw new ResearchGroupNotFoundException(researchGroupId);
        }
        if (input.sourceLaboratoryId() == null) {
            throw new InvalidInventoryException("sourceLaboratoryId must not be null");
        }
        if (input.destinationLaboratoryId() == null) {
            throw new InvalidInventoryException("destinationLaboratoryId must not be null");
        }
        if (input.sourceLaboratoryId().equals(input.destinationLaboratoryId())) {
            throw new InvalidInventoryException("Source and destination laboratories must be different");
        }

        validateLaboratoryScope(researchGroupId, input.sourceLaboratoryId(), "source");
        validateLaboratoryScope(researchGroupId, input.destinationLaboratoryId(), "destination");
        if (input.sourceLaboratoryId().compareTo(input.destinationLaboratoryId()) < 0) {
            laboratoryLookup.lockForStockUpdate(input.sourceLaboratoryId());
            laboratoryLookup.lockForStockUpdate(input.destinationLaboratoryId());
        } else {
            laboratoryLookup.lockForStockUpdate(input.destinationLaboratoryId());
            laboratoryLookup.lockForStockUpdate(input.sourceLaboratoryId());
        }

        if (input.transferredAt() == null) {
            throw new InvalidInventoryException("transferredAt must not be null");
        }
        if (input.items() == null || input.items().isEmpty()) {
            throw new InvalidInventoryException("At least one transfer item is required");
        }

        Map<UUID, InventoryStockItem> stockMap = stockQuery.findStock(researchGroupId, input.sourceLaboratoryId())
                .stream()
                .collect(Collectors.toMap(InventoryStockItem::inventoryItemId, Function.identity()));

        Set<UUID> selectedItemIds = new HashSet<>();
        List<InventoryMovementItem> transferItems = new ArrayList<>();
        for (CreateInventoryTransferItemInput line : input.items()) {
            if (line == null || line.inventoryItemId() == null) {
                throw new InvalidInventoryException("Every transfer line must reference an inventory item");
            }
            if (!selectedItemIds.add(line.inventoryItemId())) {
                throw new InvalidInventoryException("An inventory item can only appear once per transfer");
            }

            InventoryItem item = itemRepository.findById(line.inventoryItemId())
                    .filter(candidate -> candidate.getResearchGroupId().equals(researchGroupId))
                    .filter(InventoryItem::isActive)
                    .orElseThrow(() -> new InventoryItemNotFoundException(line.inventoryItemId()));

            validateQuantityForUnit(line, item);

            InventoryStockItem currentStock = stockMap.get(line.inventoryItemId());
            if (currentStock == null || currentStock.quantity().compareTo(BigDecimal.ZERO) <= 0) {
                throw new InvalidInventoryException(
                        "Insufficient stock in source laboratory for item '" + item.getName() + "'. Available: 0, requested: " + line.quantity()
                );
            }
            if (currentStock.quantity().compareTo(line.quantity()) < 0) {
                throw new InvalidInventoryException(
                        "Insufficient stock in source laboratory for item '" + item.getName() + "'. Available: " + currentStock.quantity() + ", requested: " + line.quantity()
                );
            }

            BigDecimal unitCost = currentStock.totalValue().divide(currentStock.quantity(), 2, RoundingMode.HALF_UP);
            if (unitCost.compareTo(BigDecimal.ZERO) <= 0) {
                unitCost = new BigDecimal("0.01");
            }

            transferItems.add(new InventoryMovementItem(
                    UUID.randomUUID(),
                    line.inventoryItemId(),
                    line.quantity(),
                    unitCost, null, null, null
            ));
        }

        InventoryMovement transfer = new InventoryMovement(
                UUID.randomUUID(),
                researchGroupId,
                InventoryMovementType.TRANSFER,
                InventoryMovementReason.INTERNAL_TRANSFER,
                null,
                input.sourceLaboratoryId(),
                input.destinationLaboratoryId(),
                null,
                input.transferredAt(),
                input.notes(),
                InventoryMovementStatus.CONFIRMED,
                null,
                null,
                LocalDateTime.now(),
                transferItems
        );

        movementRepository.save(transfer);
        return transfer.id();
    }

    private void validateLaboratoryScope(UUID researchGroupId, UUID laboratoryId, String label) {
        UUID laboratoryResearchGroupId = laboratoryLookup
                .findResearchGroupIdByLaboratoryId(laboratoryId)
                .orElseThrow(() -> new InventoryLaboratoryNotFoundException(laboratoryId));
        if (!researchGroupId.equals(laboratoryResearchGroupId)) {
            throw new InvalidInventoryException(label + " laboratory must belong to the specified research group");
        }
    }

    private void validateQuantityForUnit(CreateInventoryTransferItemInput line, InventoryItem item) {
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

