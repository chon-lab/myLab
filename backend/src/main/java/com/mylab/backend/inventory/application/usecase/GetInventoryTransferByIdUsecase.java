package com.mylab.backend.inventory.application.usecase;

import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.InventoryTransferHistoryRecord;
import com.mylab.backend.inventory.application.exception.InventoryTransferNotFoundException;
import com.mylab.backend.inventory.application.port.in.GetInventoryTransferPort;
import com.mylab.backend.inventory.application.port.out.InventoryTransferQueryPort;

@Service
@RequiredArgsConstructor
public class GetInventoryTransferByIdUsecase implements GetInventoryTransferPort {
    private final InventoryTransferQueryPort transferQuery;

    @Override
    @Transactional(readOnly = true)
    public InventoryTransferHistoryRecord get(UUID id) {
        Objects.requireNonNull(id, "id must not be null");
        return transferQuery.findById(id)
                .orElseThrow(() -> new InventoryTransferNotFoundException(id));
    }
}

