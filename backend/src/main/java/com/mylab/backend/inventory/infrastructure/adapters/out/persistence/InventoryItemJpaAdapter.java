package com.mylab.backend.inventory.infrastructure.adapters.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.port.out.InventoryItemRepositoryPort;
import com.mylab.backend.inventory.domain.model.InventoryItem;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.mapper.InventoryItemMapper;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryItemJpaRepository;

@Component
@RequiredArgsConstructor
public class InventoryItemJpaAdapter implements InventoryItemRepositoryPort {
    private final InventoryItemJpaRepository repository;
    private final InventoryItemMapper mapper;

    @Override
    public void save(InventoryItem item) {
        repository.save(mapper.toEntity(item));
    }

    @Override
    public Optional<InventoryItem> findById(UUID id) {
        return repository.findByIdAndDeletedAtIsNull(id).map(mapper::toDomain);
    }

    @Override
    public List<InventoryItem> findAllByResearchGroupId(UUID id) {
        return repository.findAllByResearchGroupIdAndDeletedAtIsNullOrderByName(id)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
