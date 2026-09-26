package com.mylab.backend.inventory.application.usecase;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.mylab.backend.inventory.application.dto.InventoryStockItem;
import com.mylab.backend.inventory.application.dto.ReverseInventoryEntryInput;
import com.mylab.backend.inventory.application.exception.InventoryEntryNotFoundException;
import com.mylab.backend.inventory.application.port.out.InventoryLaboratoryLookupPort;
import com.mylab.backend.inventory.application.port.out.InventoryMovementRepositoryPort;
import com.mylab.backend.inventory.application.port.out.InventoryStockQueryPort;
import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;
import com.mylab.backend.inventory.domain.model.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReverseInventoryEntryUsecaseTest {
    @Mock private InventoryMovementRepositoryPort movementRepository;
    @Mock private InventoryStockQueryPort stockQuery;
    @Mock private InventoryLaboratoryLookupPort laboratoryLookup;
    @InjectMocks private ReverseInventoryEntryUsecase usecase;

    private InventoryMovement entry(UUID id, InventoryMovementStatus status) {
        return new InventoryMovement(id, UUID.randomUUID(), InventoryMovementType.ENTRY,
                InventoryMovementReason.PURCHASE, null, UUID.randomUUID(), "Supplier",
                LocalDate.of(2026, 9, 18), null, status,
                status == InventoryMovementStatus.REVERSED ? LocalDateTime.now() : null,
                status == InventoryMovementStatus.REVERSED ? "First reversal" : null,
                LocalDateTime.now(), List.of(new InventoryMovementItem(UUID.randomUUID(), UUID.randomUUID(),
                BigDecimal.TEN, new BigDecimal("89.99"), null, null, null)));
    }

    @Test
    void reversesEntryWithAvailableStock() {
        UUID id = UUID.randomUUID();
        InventoryMovement entry = entry(id, InventoryMovementStatus.CONFIRMED);
        when(movementRepository.findByIdForUpdate(id)).thenReturn(Optional.of(entry));
        when(stockQuery.findStock(entry.researchGroupId(), entry.destinationLaboratoryId())).thenReturn(List.of(
                new InventoryStockItem(entry.items().getFirst().inventoryItemId(), "Mouse",
                        InventoryItemType.DURABLE, InventoryUnitOfMeasure.UN,
                        BigDecimal.TEN, new BigDecimal("899.90"))));
        usecase.reverse(id, new ReverseInventoryEntryInput("Duplicate invoice"));
        ArgumentCaptor<InventoryMovement> saved = ArgumentCaptor.forClass(InventoryMovement.class);
        verify(movementRepository).save(saved.capture());
        assertThat(saved.getValue().status()).isEqualTo(InventoryMovementStatus.REVERSED);
        assertThat(saved.getValue().items()).isEqualTo(entry.items());
    }

    @Test
    void rejectsReversalThatWouldMakeStockNegative() {
        UUID id = UUID.randomUUID();
        InventoryMovement entry = entry(id, InventoryMovementStatus.CONFIRMED);
        when(movementRepository.findByIdForUpdate(id)).thenReturn(Optional.of(entry));
        when(stockQuery.findStock(entry.researchGroupId(), entry.destinationLaboratoryId())).thenReturn(List.of());
        assertThatThrownBy(() -> usecase.reverse(id, new ReverseInventoryEntryInput("Duplicate")))
                .isInstanceOf(InvalidInventoryException.class).hasMessageContaining("insufficient stock");
        verify(movementRepository, never()).save(any());
    }

    @Test
    void rejectsMissingAndAlreadyReversedEntries() {
        UUID id = UUID.randomUUID();
        when(movementRepository.findByIdForUpdate(id)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> usecase.reverse(id, new ReverseInventoryEntryInput("Missing")))
                .isInstanceOf(InventoryEntryNotFoundException.class);
        reset(movementRepository);
        when(movementRepository.findByIdForUpdate(id)).thenReturn(Optional.of(entry(id, InventoryMovementStatus.REVERSED)));
        assertThatThrownBy(() -> usecase.reverse(id, new ReverseInventoryEntryInput("Again")))
                .isInstanceOf(InvalidInventoryException.class).hasMessageContaining("already reversed");
    }
}
