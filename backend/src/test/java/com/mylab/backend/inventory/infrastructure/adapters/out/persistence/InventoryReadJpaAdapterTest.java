package com.mylab.backend.inventory.infrastructure.adapters.out.persistence;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.mylab.backend.inventory.application.dto.InventoryStockItem;
import com.mylab.backend.inventory.domain.model.*;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.*;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryMovementJpaRepository;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class InventoryReadJpaAdapterTest {
    private final UUID group = UUID.randomUUID();
    private final UUID labA = UUID.randomUUID();
    private final UUID labB = UUID.randomUUID();
    private final UUID itemId = UUID.randomUUID();
    private final InventoryItemEntity item = InventoryItemEntity.builder().id(itemId).name("Mouse")
            .itemType(InventoryItemType.DURABLE).unitOfMeasure(InventoryUnitOfMeasure.UN).build();

    private InventoryMovementEntity movement(InventoryMovementType type, UUID source, UUID destination,
            InventoryMovementStatus status, String quantity, String unitCost) {
        InventoryMovementItemEntity line = InventoryMovementItemEntity.builder().id(UUID.randomUUID())
                .inventoryItemId(itemId).inventoryItem(item).quantity(new BigDecimal(quantity))
                .unitCost(new BigDecimal(unitCost)).build();
        return InventoryMovementEntity.builder().id(UUID.randomUUID()).researchGroupId(group)
                .type(type).sourceLaboratoryId(source).destinationLaboratoryId(destination)
                .status(status).items(List.of(line)).build();
    }

    @Test
    void derivesLaboratoryAndGroupBalancesAndIgnoresReversals() {
        InventoryMovementJpaRepository repository = mock(InventoryMovementJpaRepository.class);
        when(repository.findGroupWithDetails(group)).thenReturn(List.of(
                movement(InventoryMovementType.ENTRY, null, labA, InventoryMovementStatus.CONFIRMED, "10", "100"),
                movement(InventoryMovementType.TRANSFER, labA, labB, InventoryMovementStatus.CONFIRMED, "4", "100"),
                movement(InventoryMovementType.EXIT, labA, null, InventoryMovementStatus.CONFIRMED, "2", "100"),
                movement(InventoryMovementType.ENTRY, null, labB, InventoryMovementStatus.REVERSED, "3", "100")));
        InventoryReadJpaAdapter adapter = new InventoryReadJpaAdapter(repository);
        InventoryStockItem atA = adapter.findStock(group, labA).getFirst();
        InventoryStockItem atB = adapter.findStock(group, labB).getFirst();
        InventoryStockItem consolidated = adapter.findStock(group, null).getFirst();
        assertThat(atA.quantity()).isEqualByComparingTo("4");
        assertThat(atA.totalValue()).isEqualByComparingTo("400");
        assertThat(atB.quantity()).isEqualByComparingTo("4");
        assertThat(atB.totalValue()).isEqualByComparingTo("400");
        assertThat(consolidated.quantity()).isEqualByComparingTo("8");
        assertThat(consolidated.totalValue()).isEqualByComparingTo("800");
    }
}
