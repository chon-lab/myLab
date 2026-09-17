package com.mylab.backend.inventory.application.usecase;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.CreateInventoryItemInput;
import com.mylab.backend.inventory.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.inventory.application.port.in.CreateInventoryItemPort;
import com.mylab.backend.inventory.application.port.out.InventoryItemRepositoryPort;
import com.mylab.backend.inventory.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.inventory.domain.model.InventoryItem;

@Service
@RequiredArgsConstructor
public class CreateInventoryItemUsecase implements CreateInventoryItemPort {
    private final InventoryItemRepositoryPort repository;
    private final ResearchGroupLookupPort groups;
    @Transactional
    public UUID create(UUID groupId, CreateInventoryItemInput input) {
        Objects.requireNonNull(input, "input must not be null");
        if (!groups.existsById(groupId)) {
            throw new ResearchGroupNotFoundException(groupId);
        }

        LocalDateTime now = LocalDateTime.now();
        InventoryItem item = InventoryItem.builder()
                .id(UUID.randomUUID())
                .researchGroupId(groupId)
                .name(input.name())
                .description(input.description())
                .itemType(input.itemType())
                .unitOfMeasure(input.unitOfMeasure())
                .referenceUnitValue(input.referenceUnitValue())
                .active(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        repository.save(item);
        return item.getId();
    }
}
