package com.mylab.backend.inventory.infrastructure.adapters.out.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.port.out.InventoryLaboratoryLookupPort;
import com.mylab.backend.laboratory.infrastructure.adapters.out.persistence.entity.LaboratoryEntity;
import com.mylab.backend.laboratory.infrastructure.adapters.out.persistence.repository.LaboratoryJpaRepository;

@Component("inventoryLaboratoryLookupAdapter")
@RequiredArgsConstructor
public class InventoryLaboratoryLookupAdapter implements InventoryLaboratoryLookupPort {
    private final LaboratoryJpaRepository repository;

    @Override
    public Optional<UUID> findResearchGroupIdByLaboratoryId(UUID laboratoryId) {
        return repository.findByIdAndDeletedAtIsNull(laboratoryId)
                .map(LaboratoryEntity::getResearchGroupId);
    }
}
