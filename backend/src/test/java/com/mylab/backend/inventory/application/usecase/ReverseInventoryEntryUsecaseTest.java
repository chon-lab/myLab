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
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.mylab.backend.inventory.application.dto.ReverseInventoryEntryInput;
import com.mylab.backend.inventory.application.exception.InventoryEntryNotFoundException;
import com.mylab.backend.inventory.application.port.out.InventoryEntryRepositoryPort;
import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;
import com.mylab.backend.inventory.domain.model.InventoryEntry;
import com.mylab.backend.inventory.domain.model.InventoryEntryItem;
import com.mylab.backend.inventory.domain.model.InventoryEntrySource;
import com.mylab.backend.inventory.domain.model.InventoryEntryStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReverseInventoryEntryUsecaseTest {

    @Mock
    private InventoryEntryRepositoryPort entryRepository;

    @InjectMocks
    private ReverseInventoryEntryUsecase usecase;

    private InventoryEntry createConfirmedEntry(UUID entryId) {
        InventoryEntryItem item = new InventoryEntryItem(
                UUID.randomUUID(),
                UUID.randomUUID(),
                BigDecimal.valueOf(10),
                BigDecimal.valueOf(89.99),
                "LOTE-1",
                "Logitech",
                null
        );

        return new InventoryEntry(
                entryId,
                UUID.randomUUID(),
                UUID.randomUUID(),
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
    }

    @Test
    @DisplayName("Should successfully reverse a confirmed inventory entry")
    void shouldSuccessfullyReverseConfirmedEntry() {
        UUID entryId = UUID.randomUUID();
        InventoryEntry confirmedEntry = createConfirmedEntry(entryId);

        when(entryRepository.findById(entryId)).thenReturn(Optional.of(confirmedEntry));

        ReverseInventoryEntryInput input = new ReverseInventoryEntryInput("Nota fiscal registrada em duplicidade");
        usecase.reverse(entryId, input);

        ArgumentCaptor<InventoryEntry> captor = ArgumentCaptor.forClass(InventoryEntry.class);
        verify(entryRepository).save(captor.capture());

        InventoryEntry savedEntry = captor.getValue();
        assertThat(savedEntry.id()).isEqualTo(entryId);
        assertThat(savedEntry.status()).isEqualTo(InventoryEntryStatus.REVERSED);
        assertThat(savedEntry.reversalReason()).isEqualTo("Nota fiscal registrada em duplicidade");
        assertThat(savedEntry.reversedAt()).isNotNull();
        assertThat(savedEntry.items()).hasSize(1);
        assertThat(savedEntry.items().get(0).id()).isEqualTo(confirmedEntry.items().get(0).id());
    }

    @Test
    @DisplayName("Should throw InventoryEntryNotFoundException when entry does not exist")
    void shouldThrowNotFoundWhenEntryDoesNotExist() {
        UUID entryId = UUID.randomUUID();
        when(entryRepository.findById(entryId)).thenReturn(Optional.empty());

        ReverseInventoryEntryInput input = new ReverseInventoryEntryInput("Nota duplicada");

        assertThatThrownBy(() -> usecase.reverse(entryId, input))
                .isInstanceOf(InventoryEntryNotFoundException.class)
                .hasMessageContaining(entryId.toString());
    }

    @Test
    @DisplayName("Should throw InvalidInventoryException when entry is already reversed")
    void shouldThrowWhenEntryIsAlreadyReversed() {
        UUID entryId = UUID.randomUUID();
        InventoryEntry confirmedEntry = createConfirmedEntry(entryId);
        InventoryEntry alreadyReversedEntry = confirmedEntry.reverse("Primeiro estorno", LocalDateTime.now());

        when(entryRepository.findById(entryId)).thenReturn(Optional.of(alreadyReversedEntry));

        ReverseInventoryEntryInput input = new ReverseInventoryEntryInput("Tentando estornar de novo");

        assertThatThrownBy(() -> usecase.reverse(entryId, input))
                .isInstanceOf(InvalidInventoryException.class)
                .hasMessageContaining("already reversed");
    }

    @Test
    @DisplayName("Should throw InvalidInventoryException when reason is blank")
    void shouldThrowWhenReasonIsBlank() {
        UUID entryId = UUID.randomUUID();
        ReverseInventoryEntryInput input = new ReverseInventoryEntryInput("   ");

        assertThatThrownBy(() -> usecase.reverse(entryId, input))
                .isInstanceOf(InvalidInventoryException.class)
                .hasMessageContaining("reversal reason must not be blank");
    }

    @Test
    @DisplayName("Should throw NullPointerException when entryId is null")
    void shouldThrowWhenEntryIdIsNull() {
        ReverseInventoryEntryInput input = new ReverseInventoryEntryInput("Motivo");

        assertThatThrownBy(() -> usecase.reverse(null, input))
                .isInstanceOf(NullPointerException.class);
    }
}

