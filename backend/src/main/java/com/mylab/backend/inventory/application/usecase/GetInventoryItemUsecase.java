package com.mylab.backend.inventory.application.usecase;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.exception.InventoryItemNotFoundException;
import com.mylab.backend.inventory.application.port.in.GetInventoryItemPort;
import com.mylab.backend.inventory.application.port.out.InventoryItemRepositoryPort;
import com.mylab.backend.inventory.domain.model.InventoryItem;

@Service
@RequiredArgsConstructor
public class GetInventoryItemUsecase implements GetInventoryItemPort {
    private final InventoryItemRepositoryPort repository;

    @Transactional(readOnly = true)
    public InventoryItem get(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new InventoryItemNotFoundException(id));
    }
}
