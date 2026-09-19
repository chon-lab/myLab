package com.mylab.backend.inventory.application.usecase;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.mylab.backend.inventory.application.dto.InventoryEntryHistoryItem;
import com.mylab.backend.inventory.application.dto.InventoryEntryHistoryRecord;
import com.mylab.backend.inventory.application.exception.InventoryEntryNotFoundException;
import com.mylab.backend.inventory.application.port.out.InventoryEntryQueryPort;
import com.mylab.backend.inventory.domain.model.InventoryEntrySource;
import com.mylab.backend.inventory.domain.model.InventoryEntryStatus;
import com.mylab.backend.inventory.domain.model.InventoryItemType;
import com.mylab.backend.inventory.domain.model.InventoryUnitOfMeasure;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GetInventoryEntryByIdUsecaseTest {

    @Mock
    private InventoryEntryQueryPort entryQuery;

    @InjectMocks
    private GetInventoryEntryByIdUsecase usecase;

    @Test
    @DisplayName("Should return entry details when entry exists")
    void shouldReturnEntryDetailsWhenExists() {
        UUID entryId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        UUID labId = UUID.randomUUID();
        UUID itemId = UUID.randomUUID();

        InventoryEntryHistoryItem item = new InventoryEntryHistoryItem(
                UUID.randomUUID(),
                itemId,
                "Mouse sem fio Logitech",
                InventoryItemType.DURABLE,
                InventoryUnitOfMeasure.UN,
                BigDecimal.valueOf(10),
                BigDecimal.valueOf(89.99),
                null,
                null,
                null
        );

        InventoryEntryHistoryRecord record = new InventoryEntryHistoryRecord(
                entryId,
                groupId,
                labId,
                "Laboratório de Sistemas Inteligentes",
                InventoryEntrySource.PURCHASE,
                "Fornecedor Exemplo",
                LocalDate.of(2026, 9, 18),
                "Entrada de equipamentos",
                InventoryEntryStatus.CONFIRMED,
                null,
                null,
                LocalDateTime.now(),
                List.of(item)
        );

        when(entryQuery.findById(entryId)).thenReturn(Optional.of(record));

        InventoryEntryHistoryRecord result = usecase.get(entryId);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(entryId);
        assertThat(result.researchGroupId()).isEqualTo(groupId);
        assertThat(result.laboratoryId()).isEqualTo(labId);
        assertThat(result.laboratoryName()).isEqualTo("Laboratório de Sistemas Inteligentes");
        assertThat(result.source()).isEqualTo(InventoryEntrySource.PURCHASE);
        assertThat(result.sourceName()).isEqualTo("Fornecedor Exemplo");
        assertThat(result.status()).isEqualTo(InventoryEntryStatus.CONFIRMED);
        assertThat(result.items()).hasSize(1);
        assertThat(result.items().get(0).itemName()).isEqualTo("Mouse sem fio Logitech");

        verify(entryQuery).findById(entryId);
    }

    @Test
    @DisplayName("Should throw InventoryEntryNotFoundException when entry does not exist")
    void shouldThrowNotFoundWhenEntryDoesNotExist() {
        UUID entryId = UUID.randomUUID();
        when(entryQuery.findById(entryId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> usecase.get(entryId))
                .isInstanceOf(InventoryEntryNotFoundException.class)
                .hasMessageContaining(entryId.toString());

        verify(entryQuery).findById(entryId);
    }

    @Test
    @DisplayName("Should throw NullPointerException when id is null")
    void shouldThrowNullPointerExceptionWhenIdIsNull() {
        assertThatThrownBy(() -> usecase.get(null))
                .isInstanceOf(NullPointerException.class)
                .hasMessage("id must not be null");
    }
}
