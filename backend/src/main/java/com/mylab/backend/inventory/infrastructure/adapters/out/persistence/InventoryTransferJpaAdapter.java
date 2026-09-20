package com.mylab.backend.inventory.infrastructure.adapters.out.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.port.out.InventoryTransferRepositoryPort;
import com.mylab.backend.inventory.domain.model.InventoryTransfer;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryTransferEntity;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.mapper.InventoryTransferMapper;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryTransferJpaRepository;

@Component
@RequiredArgsConstructor
public class InventoryTransferJpaAdapter implements InventoryTransferRepositoryPort {
    private final InventoryTransferJpaRepository repository;
    private final InventoryTransferMapper mapper;

    @Override
    public void save(InventoryTransfer transfer) {
        Optional<InventoryTransferEntity> existingOpt = repository.findById(transfer.id());
        if (existingOpt.isPresent()) {
            InventoryTransferEntity existing = existingOpt.get();
            existing.setStatus(transfer.status());
            existing.setReversedAt(transfer.reversedAt());
            existing.setReversalReason(transfer.reversalReason());
            repository.save(existing);
        } else {
            repository.save(mapper.toEntity(transfer));
        }
    }

    @Override
    public Optional<InventoryTransfer> findById(UUID id) {
        return repository.findByIdWithDetails(id).map(mapper::toDomain);
    }
}

