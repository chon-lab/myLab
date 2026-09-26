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
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.mylab.backend.inventory.application.dto.*;
import com.mylab.backend.inventory.application.port.out.*;
import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;
import com.mylab.backend.inventory.domain.model.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CreateInventoryMovementUsecaseTest {
    @Mock private InventoryMovementRepositoryPort movements;
    @Mock private InventoryItemRepositoryPort items;
    @Mock private ResearchGroupLookupPort groups;
    @Mock private InventoryLaboratoryLookupPort labs;
    @Mock private InventoryStockQueryPort stock;

    private final UUID groupId = UUID.randomUUID();
    private final UUID sourceId = UUID.randomUUID();
    private final UUID destinationId = UUID.randomUUID();
    private final UUID itemId = UUID.randomUUID();

    private InventoryItem item() {
        LocalDateTime now = LocalDateTime.now();
        return InventoryItem.builder().id(itemId).researchGroupId(groupId).name("Mouse")
                .itemType(InventoryItemType.DURABLE).unitOfMeasure(InventoryUnitOfMeasure.UN)
                .referenceUnitValue(new BigDecimal("110.00")).active(true)
                .createdAt(now).updatedAt(now).build();
    }

    private void allowLab(UUID id) {
        when(groups.existsById(groupId)).thenReturn(true);
        when(labs.findResearchGroupIdByLaboratoryId(id)).thenReturn(Optional.of(groupId));
        when(items.findById(itemId)).thenReturn(Optional.of(item()));
    }

    @Test
    void entryStoresUserCostAsHistoricalCost() {
        allowLab(destinationId);
        CreateInventoryEntryUsecase usecase = new CreateInventoryEntryUsecase(movements, items, groups, labs);
        usecase.create(groupId, new CreateInventoryEntryInput(destinationId, InventoryEntrySource.PURCHASE,
                "Supplier", LocalDate.now(), null, List.of(new CreateInventoryEntryItemInput(itemId,
                BigDecimal.TEN, new BigDecimal("100.00"), "B1", null, null))));
        ArgumentCaptor<InventoryMovement> saved = ArgumentCaptor.forClass(InventoryMovement.class);
        verify(movements).save(saved.capture());
        assertThat(saved.getValue().type()).isEqualTo(InventoryMovementType.ENTRY);
        assertThat(saved.getValue().destinationLaboratoryId()).isEqualTo(destinationId);
        assertThat(saved.getValue().items().getFirst().unitCost()).isEqualByComparingTo("100.00");
    }

    @Test
    void exitUsesSourceAverageCostAndRejectsInsufficientStock() {
        allowLab(sourceId);
        when(stock.findStock(groupId, sourceId)).thenReturn(List.of(new InventoryStockItem(itemId, "Mouse",
                InventoryItemType.DURABLE, InventoryUnitOfMeasure.UN,
                BigDecimal.TEN, new BigDecimal("1066.70"))));
        CreateInventoryExitUsecase usecase = new CreateInventoryExitUsecase(movements, items, groups, labs, stock);
        usecase.create(groupId, new CreateInventoryExitInput(sourceId, InventoryExitType.CONSUMPTION,
                LocalDate.now(), null, List.of(new CreateInventoryExitItemInput(itemId, new BigDecimal("2")))));
        ArgumentCaptor<InventoryMovement> saved = ArgumentCaptor.forClass(InventoryMovement.class);
        verify(movements).save(saved.capture());
        assertThat(saved.getValue().type()).isEqualTo(InventoryMovementType.EXIT);
        assertThat(saved.getValue().items().getFirst().unitCost()).isEqualByComparingTo("106.67");
        assertThatThrownBy(() -> usecase.create(groupId, new CreateInventoryExitInput(sourceId,
                InventoryExitType.CONSUMPTION, LocalDate.now(), null,
                List.of(new CreateInventoryExitItemInput(itemId, new BigDecimal("11"))))))
                .isInstanceOf(InvalidInventoryException.class).hasMessageContaining("Insufficient stock");
    }

    @Test
    void transferUsesOneCostAndChecksSourceBalance() {
        when(groups.existsById(groupId)).thenReturn(true);
        when(labs.findResearchGroupIdByLaboratoryId(sourceId)).thenReturn(Optional.of(groupId));
        when(labs.findResearchGroupIdByLaboratoryId(destinationId)).thenReturn(Optional.of(groupId));
        when(items.findById(itemId)).thenReturn(Optional.of(item()));
        when(stock.findStock(groupId, sourceId)).thenReturn(List.of(new InventoryStockItem(itemId, "Mouse",
                InventoryItemType.DURABLE, InventoryUnitOfMeasure.UN,
                BigDecimal.TEN, new BigDecimal("1066.70"))));
        CreateInventoryTransferUsecase usecase = new CreateInventoryTransferUsecase(
                movements, items, groups, labs, stock);
        usecase.create(groupId, new CreateInventoryTransferInput(sourceId, destinationId,
                LocalDate.now(), null, List.of(new CreateInventoryTransferItemInput(itemId, new BigDecimal("3")))));
        ArgumentCaptor<InventoryMovement> saved = ArgumentCaptor.forClass(InventoryMovement.class);
        verify(movements).save(saved.capture());
        assertThat(saved.getValue().type()).isEqualTo(InventoryMovementType.TRANSFER);
        assertThat(saved.getValue().items().getFirst().unitCost()).isEqualByComparingTo("106.67");
        assertThatThrownBy(() -> usecase.create(groupId, new CreateInventoryTransferInput(sourceId,
                destinationId, LocalDate.now(), null,
                List.of(new CreateInventoryTransferItemInput(itemId, new BigDecimal("11"))))))
                .isInstanceOf(InvalidInventoryException.class).hasMessageContaining("Insufficient stock");
    }
}
