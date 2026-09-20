package com.mylab.backend.inventory.application.usecase;

import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.InventoryExitHistoryRecord;
import com.mylab.backend.inventory.application.exception.InventoryExitNotFoundException;
import com.mylab.backend.inventory.application.port.in.GetInventoryExitPort;
import com.mylab.backend.inventory.application.port.out.InventoryExitQueryPort;

@Service
@RequiredArgsConstructor
public class GetInventoryExitByIdUsecase implements GetInventoryExitPort {
    private final InventoryExitQueryPort exitQuery;

    @Override
    @Transactional(readOnly = true)
    public InventoryExitHistoryRecord get(UUID id) {
        Objects.requireNonNull(id, "id must not be null");
        return exitQuery.findById(id)
                .orElseThrow(() -> new InventoryExitNotFoundException(id));
    }
}

