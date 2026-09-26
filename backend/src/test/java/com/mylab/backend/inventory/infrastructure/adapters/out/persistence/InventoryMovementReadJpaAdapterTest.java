package com.mylab.backend.inventory.infrastructure.adapters.out.persistence;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.mylab.backend.inventory.application.dto.InventoryMovementSearchCriteria;
import com.mylab.backend.inventory.domain.model.*;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.*;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryMovementJpaRepository;
import com.mylab.backend.laboratory.infrastructure.adapters.out.persistence.entity.LaboratoryEntity;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class InventoryMovementReadJpaAdapterTest {
    @Test
    void filtersUnifiedHistoryAndKeepsReversedMovementsVisible() {
        UUID groupId = UUID.randomUUID();
        UUID itemId = UUID.randomUUID();
        UUID labA = UUID.randomUUID();
        UUID labB = UUID.randomUUID();
        InventoryItemEntity item = InventoryItemEntity.builder().id(itemId).name("Mouse").build();
        InventoryMovementEntity entry = movement(groupId, InventoryMovementType.ENTRY,
                InventoryMovementReason.PURCHASE, InventoryMovementStatus.CONFIRMED,
                null, labA, null, LaboratoryEntity.builder().id(labA).name("A").build(),
                item, LocalDate.of(2026, 9, 10));
        InventoryMovementEntity transfer = movement(groupId, InventoryMovementType.TRANSFER,
                InventoryMovementReason.INTERNAL_TRANSFER, InventoryMovementStatus.REVERSED,
                labA, labB, LaboratoryEntity.builder().id(labA).name("A").build(),
                LaboratoryEntity.builder().id(labB).name("B").build(), item, LocalDate.of(2026, 9, 12));
        InventoryMovementJpaRepository repository = mock(InventoryMovementJpaRepository.class);
        when(repository.findGroupWithDetails(groupId)).thenReturn(List.of(entry, transfer));
        InventoryMovementReadJpaAdapter adapter = new InventoryMovementReadJpaAdapter(repository);

        var result = adapter.findHistory(groupId, new InventoryMovementSearchCriteria(labB, itemId,
                InventoryMovementType.TRANSFER, InventoryMovementReason.INTERNAL_TRANSFER,
                InventoryMovementStatus.REVERSED, LocalDate.of(2026, 9, 11), LocalDate.of(2026, 9, 13)));
        assertThat(result).hasSize(1);
        assertThat(result.getFirst().id()).isEqualTo(transfer.getId());
        assertThat(result.getFirst().items().getFirst().totalValue()).isEqualByComparingTo("20.00");
        assertThat(adapter.findHistory(groupId, new InventoryMovementSearchCriteria(null, null,
                InventoryMovementType.EXIT, null, null, null, null))).isEmpty();
    }

    private InventoryMovementEntity movement(UUID groupId, InventoryMovementType type,
            InventoryMovementReason reason, InventoryMovementStatus status, UUID sourceId, UUID destinationId,
            LaboratoryEntity source, LaboratoryEntity destination, InventoryItemEntity item, LocalDate date) {
        InventoryMovementItemEntity line = InventoryMovementItemEntity.builder().id(UUID.randomUUID())
                .inventoryItemId(item.getId()).inventoryItem(item).quantity(new BigDecimal("2"))
                .unitCost(new BigDecimal("10.00")).build();
        return InventoryMovementEntity.builder().id(UUID.randomUUID()).researchGroupId(groupId)
                .type(type).reason(reason).status(status).sourceLaboratoryId(sourceId)
                .destinationLaboratoryId(destinationId).sourceLaboratory(source)
                .destinationLaboratory(destination).occurredAt(date).createdAt(LocalDateTime.now())
                .items(List.of(line)).build();
    }
}
