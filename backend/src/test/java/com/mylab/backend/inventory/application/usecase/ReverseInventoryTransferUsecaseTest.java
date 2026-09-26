package com.mylab.backend.inventory.application.usecase;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.mylab.backend.inventory.application.dto.InventoryStockItem;
import com.mylab.backend.inventory.application.dto.ReverseInventoryTransferInput;
import com.mylab.backend.inventory.application.port.out.*;
import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;
import com.mylab.backend.inventory.domain.model.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReverseInventoryTransferUsecaseTest {
    @Mock private InventoryMovementRepositoryPort movements;
    @Mock private InventoryStockQueryPort stock;
    @Mock private InventoryItemRepositoryPort items;
    @Mock private InventoryLaboratoryLookupPort labs;
    @InjectMocks private ReverseInventoryTransferUsecase usecase;

    @Test
    void rejectsReversalWhenDestinationConsumedTransferredQuantity() {
        UUID id = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        UUID sourceId = UUID.randomUUID();
        UUID destinationId = UUID.randomUUID();
        UUID itemId = UUID.randomUUID();
        InventoryMovement transfer = new InventoryMovement(id, groupId, InventoryMovementType.TRANSFER,
                InventoryMovementReason.INTERNAL_TRANSFER, sourceId, destinationId, null, LocalDate.now(),
                null, InventoryMovementStatus.CONFIRMED, null, null, LocalDateTime.now(),
                List.of(new InventoryMovementItem(UUID.randomUUID(), itemId, new BigDecimal("5"),
                        new BigDecimal("10.00"), null, null, null)));
        when(movements.findByIdForUpdate(id)).thenReturn(Optional.of(transfer));
        when(stock.findStock(groupId, destinationId)).thenReturn(List.of(new InventoryStockItem(itemId,
                "Mouse", InventoryItemType.DURABLE, InventoryUnitOfMeasure.UN,
                new BigDecimal("2"), new BigDecimal("20.00"))));
        assertThatThrownBy(() -> usecase.reverse(id, new ReverseInventoryTransferInput("Correction")))
                .isInstanceOf(InvalidInventoryException.class).hasMessageContaining("sufficient stock");
        verify(movements, never()).save(any());
    }
}
