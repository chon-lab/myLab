package com.mylab.backend.inventory.infrastructure.adapters.out.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.port.out.InventoryExitRepositoryPort;
import com.mylab.backend.inventory.domain.model.InventoryExit;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryExitEntity;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.mapper.InventoryExitMapper;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryExitJpaRepository;

@Component
@RequiredArgsConstructor
public class InventoryExitJpaAdapter implements InventoryExitRepositoryPort {
    private final InventoryExitJpaRepository repository;
    private final InventoryExitMapper mapper;

    @Override
    public void save(InventoryExit exit) {
        Optional<InventoryExitEntity> existingOpt = repository.findById(exit.id());
        if (existingOpt.isPresent()) {
            InventoryExitEntity existing = existingOpt.get();
            existing.setStatus(exit.status());
            existing.setReversedAt(exit.reversedAt());
            existing.setReversalReason(exit.reversalReason());
            repository.save(existing);
        } else {
            repository.save(mapper.toEntity(exit));
        }
    }

    @Override
    public Optional<InventoryExit> findById(UUID id) {
        return repository.findByIdWithDetails(id).map(mapper::toDomain);
    }
}

