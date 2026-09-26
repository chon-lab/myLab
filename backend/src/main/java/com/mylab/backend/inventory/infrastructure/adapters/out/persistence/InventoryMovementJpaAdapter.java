package com.mylab.backend.inventory.infrastructure.adapters.out.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

import com.mylab.backend.inventory.application.port.out.InventoryMovementRepositoryPort;
import com.mylab.backend.inventory.domain.model.InventoryMovement;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryMovementEntity;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.mapper.InventoryMovementMapper;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryMovementJpaRepository;

@Component
@RequiredArgsConstructor
public class InventoryMovementJpaAdapter implements InventoryMovementRepositoryPort {
    private final InventoryMovementJpaRepository repository;
    private final InventoryMovementMapper mapper;

    @Override
    public void save(InventoryMovement movement) {
        Optional<InventoryMovementEntity> existing = repository.findById(movement.id());
        if (existing.isPresent()) {
            InventoryMovementEntity entity = existing.get();
            entity.setStatus(movement.status());
            entity.setReversedAt(movement.reversedAt());
            entity.setReversalReason(movement.reversalReason());
            repository.save(entity);
        } else {
            repository.save(mapper.toEntity(movement));
        }
    }

    @Override
    public Optional<InventoryMovement> findById(UUID id) {
        return repository.findByIdWithDetails(id).map(mapper::toDomain);
    }

    @Override
    public Optional<InventoryMovement> findByIdForUpdate(UUID id) {
        return repository.lockById(id).flatMap(ignored -> repository.findByIdWithDetails(id))
                .map(mapper::toDomain);
    }
}
