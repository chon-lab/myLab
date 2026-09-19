package com.mylab.backend.inventory.infrastructure.adapters.out.persistence;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.port.out.InventoryEntryRepositoryPort;
import com.mylab.backend.inventory.domain.model.InventoryEntry;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.mapper.InventoryEntryMapper;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryEntryJpaRepository;

@Component
@RequiredArgsConstructor
public class InventoryEntryJpaAdapter implements InventoryEntryRepositoryPort {
    private final InventoryEntryJpaRepository repository;
    private final InventoryEntryMapper mapper;

    @Override
    public void save(InventoryEntry entry) {
        repository.save(mapper.toEntity(entry));
    }
}
