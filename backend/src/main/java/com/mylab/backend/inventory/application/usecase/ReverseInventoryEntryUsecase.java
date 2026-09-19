package com.mylab.backend.inventory.application.usecase;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.ReverseInventoryEntryInput;
import com.mylab.backend.inventory.application.exception.InventoryEntryNotFoundException;
import com.mylab.backend.inventory.application.port.in.ReverseInventoryEntryPort;
import com.mylab.backend.inventory.application.port.out.InventoryEntryRepositoryPort;
import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;
import com.mylab.backend.inventory.domain.model.InventoryEntry;

@Service
@RequiredArgsConstructor
public class ReverseInventoryEntryUsecase implements ReverseInventoryEntryPort {
    private final InventoryEntryRepositoryPort entryRepository;

    @Override
    @Transactional
    public void reverse(UUID entryId, ReverseInventoryEntryInput input) {
        Objects.requireNonNull(entryId, "entryId must not be null");
        if (input == null || input.reason() == null || input.reason().isBlank()) {
            throw new InvalidInventoryException("reversal reason must not be blank");
        }

        InventoryEntry entry = entryRepository.findById(entryId)
                .orElseThrow(() -> new InventoryEntryNotFoundException(entryId));

        InventoryEntry reversed = entry.reverse(input.reason(), LocalDateTime.now());
        entryRepository.save(reversed);
    }
}

