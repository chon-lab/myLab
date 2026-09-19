package com.mylab.backend.inventory.application.usecase;

import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.InventoryEntryHistoryRecord;
import com.mylab.backend.inventory.application.exception.InventoryEntryNotFoundException;
import com.mylab.backend.inventory.application.port.in.GetInventoryEntryPort;
import com.mylab.backend.inventory.application.port.out.InventoryEntryQueryPort;

@Service
@RequiredArgsConstructor
public class GetInventoryEntryByIdUsecase implements GetInventoryEntryPort {
    private final InventoryEntryQueryPort entryQuery;

    @Override
    @Transactional(readOnly = true)
    public InventoryEntryHistoryRecord get(UUID id) {
        Objects.requireNonNull(id, "id must not be null");
        return entryQuery.findById(id)
                .orElseThrow(() -> new InventoryEntryNotFoundException(id));
    }
}
