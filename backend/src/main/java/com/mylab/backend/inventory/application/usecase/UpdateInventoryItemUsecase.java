package com.mylab.backend.inventory.application.usecase;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.UpdateInventoryItemInput;
import com.mylab.backend.inventory.application.exception.InventoryItemNotFoundException;
import com.mylab.backend.inventory.application.port.in.UpdateInventoryItemPort;
import com.mylab.backend.inventory.application.port.out.InventoryItemRepositoryPort;

@Service
@RequiredArgsConstructor
public class UpdateInventoryItemUsecase implements UpdateInventoryItemPort {
    private final InventoryItemRepositoryPort repository;

    @Transactional
    public void update(UUID id, UpdateInventoryItemInput input) {
        Objects.requireNonNull(input, "input must not be null");
        var item = repository.findById(id)
                .orElseThrow(() -> new InventoryItemNotFoundException(id));
        item.updateDetails(
                input.name(),
                input.description(),
                input.referenceUnitValue(),
                LocalDateTime.now()
        );
        repository.save(item);
    }
}
