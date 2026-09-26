package com.mylab.backend.inventory.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;

import static org.assertj.core.api.Assertions.*;

class InventoryMovementTest {
    private final UUID group = UUID.randomUUID();
    private final UUID labA = UUID.randomUUID();
    private final UUID labB = UUID.randomUUID();
    private final InventoryMovementItem line = new InventoryMovementItem(UUID.randomUUID(), UUID.randomUUID(),
            BigDecimal.ONE, new BigDecimal("12.50"), null, null, null);

    private InventoryMovement movement(InventoryMovementType type, InventoryMovementReason reason,
            UUID source, UUID destination, String external, List<InventoryMovementItem> items) {
        return new InventoryMovement(UUID.randomUUID(), group, type, reason, source, destination, external,
                LocalDate.now(), null, InventoryMovementStatus.CONFIRMED, null, null,
                LocalDateTime.now(), items);
    }

    @Test
    void acceptsRoutesAndTheirReasons() {
        assertThat(movement(InventoryMovementType.ENTRY, InventoryMovementReason.PURCHASE,
                null, labA, "Supplier", List.of(line)).type()).isEqualTo(InventoryMovementType.ENTRY);
        assertThat(movement(InventoryMovementType.EXIT, InventoryMovementReason.CONSUMPTION,
                labA, null, null, List.of(line)).type()).isEqualTo(InventoryMovementType.EXIT);
        assertThat(movement(InventoryMovementType.TRANSFER, InventoryMovementReason.INTERNAL_TRANSFER,
                labA, labB, null, List.of(line)).type()).isEqualTo(InventoryMovementType.TRANSFER);
    }

    @Test
    void rejectsInvalidRoutesReasonsAndDuplicateItems() {
        assertThatThrownBy(() -> movement(InventoryMovementType.ENTRY, InventoryMovementReason.LOSS,
                null, labA, "Supplier", List.of(line))).isInstanceOf(InvalidInventoryException.class);
        assertThatThrownBy(() -> movement(InventoryMovementType.EXIT, InventoryMovementReason.CONSUMPTION,
                null, labA, null, List.of(line))).isInstanceOf(InvalidInventoryException.class);
        assertThatThrownBy(() -> movement(InventoryMovementType.TRANSFER, InventoryMovementReason.INTERNAL_TRANSFER,
                labA, labA, null, List.of(line))).isInstanceOf(InvalidInventoryException.class);
        assertThatThrownBy(() -> movement(InventoryMovementType.ENTRY, InventoryMovementReason.PURCHASE,
                null, labA, "Supplier", List.of(line, line))).isInstanceOf(InvalidInventoryException.class);
    }

    @Test
    void reversalRetainsHistoryAndCannotRepeat() {
        InventoryMovement movement = movement(InventoryMovementType.ENTRY, InventoryMovementReason.PURCHASE,
                null, labA, "Supplier", List.of(line));
        InventoryMovement reversed = movement.reverse("Duplicate", LocalDateTime.now());
        assertThat(reversed.status()).isEqualTo(InventoryMovementStatus.REVERSED);
        assertThat(reversed.items()).isEqualTo(movement.items());
        assertThatThrownBy(() -> reversed.reverse("Again", LocalDateTime.now()))
                .isInstanceOf(InvalidInventoryException.class);
    }

    @Test
    void requiresPositiveQuantityAndCost() {
        assertThatThrownBy(() -> new InventoryMovementItem(UUID.randomUUID(), line.inventoryItemId(),
                BigDecimal.ZERO, BigDecimal.ONE, null, null, null)).isInstanceOf(InvalidInventoryException.class);
        assertThatThrownBy(() -> new InventoryMovementItem(UUID.randomUUID(), line.inventoryItemId(),
                BigDecimal.ONE, BigDecimal.ZERO, null, null, null)).isInstanceOf(InvalidInventoryException.class);
    }
}
