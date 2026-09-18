package com.mylab.backend.inventory.application.usecase;

import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.exception.InventoryItemNotFoundException;
import com.mylab.backend.inventory.application.port.in.DeleteInventoryItemPort;
import com.mylab.backend.inventory.application.port.out.InventoryItemRepositoryPort;

@Service
@RequiredArgsConstructor
public class DeleteInventoryItemUsecase implements DeleteInventoryItemPort {
    private final InventoryItemRepositoryPort repository;

    @Transactional
    public void delete(UUID id) {
        var item = repository.findById(id)
                .orElseThrow(() -> new InventoryItemNotFoundException(id));
        item.archive(LocalDateTime.now());
        repository.save(item);
    }
}
