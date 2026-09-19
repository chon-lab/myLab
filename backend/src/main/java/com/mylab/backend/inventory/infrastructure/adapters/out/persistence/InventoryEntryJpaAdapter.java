package com.mylab.backend.inventory.infrastructure.adapters.out.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.port.out.InventoryEntryRepositoryPort;
import com.mylab.backend.inventory.domain.model.InventoryEntry;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryEntryEntity;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.mapper.InventoryEntryMapper;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryEntryJpaRepository;

@Component
@RequiredArgsConstructor
public class InventoryEntryJpaAdapter implements InventoryEntryRepositoryPort {
    private final InventoryEntryJpaRepository repository;
    private final InventoryEntryMapper mapper;

    @Override
    public void save(InventoryEntry entry) {
        Optional<InventoryEntryEntity> existingOpt = repository.findById(entry.id());
        if (existingOpt.isPresent()) {
            InventoryEntryEntity existing = existingOpt.get();
            existing.setStatus(entry.status());
            existing.setReversedAt(entry.reversedAt());
            existing.setReversalReason(entry.reversalReason());
            repository.save(existing);
        } else {
            repository.save(mapper.toEntity(entry));
        }
    }

    @Override
    public Optional<InventoryEntry> findById(UUID id) {
        return repository.findByIdWithDetails(id).map(mapper::toDomain);
    }
}
