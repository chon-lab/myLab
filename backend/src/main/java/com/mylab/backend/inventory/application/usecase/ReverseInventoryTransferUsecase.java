package com.mylab.backend.inventory.application.usecase;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.InventoryStockItem;
import com.mylab.backend.inventory.application.dto.ReverseInventoryTransferInput;
import com.mylab.backend.inventory.application.exception.InventoryTransferNotFoundException;
import com.mylab.backend.inventory.application.port.in.ReverseInventoryTransferPort;
import com.mylab.backend.inventory.application.port.out.InventoryItemRepositoryPort;
import com.mylab.backend.inventory.application.port.out.InventoryStockQueryPort;
import com.mylab.backend.inventory.application.port.out.InventoryTransferRepositoryPort;
import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;
import com.mylab.backend.inventory.domain.model.InventoryItem;
import com.mylab.backend.inventory.domain.model.InventoryTransfer;
import com.mylab.backend.inventory.domain.model.InventoryTransferItem;
import com.mylab.backend.inventory.domain.model.InventoryTransferStatus;

@Service
@RequiredArgsConstructor
public class ReverseInventoryTransferUsecase implements ReverseInventoryTransferPort {
    private final InventoryTransferRepositoryPort transferRepository;
    private final InventoryStockQueryPort stockQuery;
    private final InventoryItemRepositoryPort itemRepository;

    @Override
    @Transactional
    public void reverse(UUID transferId, ReverseInventoryTransferInput input) {
        Objects.requireNonNull(transferId, "transferId must not be null");
        if (input == null || input.reason() == null || input.reason().isBlank()) {
            throw new InvalidInventoryException("reversal reason must not be blank");
        }

        InventoryTransfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new InventoryTransferNotFoundException(transferId));

        if (transfer.status() == InventoryTransferStatus.REVERSED) {
            throw new InvalidInventoryException("Inventory transfer is already reversed");
        }

        Map<UUID, InventoryStockItem> destinationStock = stockQuery
                .findStock(transfer.researchGroupId(), transfer.destinationLaboratoryId())
                .stream()
                .collect(Collectors.toMap(InventoryStockItem::inventoryItemId, Function.identity()));

        for (InventoryTransferItem line : transfer.items()) {
            InventoryStockItem stockItem = destinationStock.get(line.inventoryItemId());
            BigDecimal available = stockItem == null ? BigDecimal.ZERO : stockItem.quantity();

            if (available.compareTo(line.quantity()) < 0) {
                String itemName = itemRepository.findById(line.inventoryItemId())
                        .map(InventoryItem::getName)
                        .orElse(line.inventoryItemId().toString());

                throw new InvalidInventoryException(
                        "Cannot reverse transfer: destination laboratory does not have sufficient stock for item '"
                                + itemName + "'. Available: " + available + ", required: " + line.quantity()
                );
            }
        }

        InventoryTransfer reversed = transfer.reverse(input.reason(), LocalDateTime.now());
        transferRepository.save(reversed);
    }
}

