package com.mylab.backend.inventory.infrastructure.adapters.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.port.out.InventoryEntryDocumentRepositoryPort;
import com.mylab.backend.inventory.domain.model.InventoryEntryDocument;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.mapper.InventoryEntryDocumentMapper;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryEntryDocumentJpaRepository;

@Component
@RequiredArgsConstructor
public class InventoryEntryDocumentJpaAdapter implements InventoryEntryDocumentRepositoryPort {
    private final InventoryEntryDocumentJpaRepository repository;
    private final InventoryEntryDocumentMapper mapper;

    @Override
    public void save(InventoryEntryDocument document) {
        repository.save(mapper.toEntity(document));
    }

    @Override
    public Optional<InventoryEntryDocument> findByIdAndEntryId(UUID id, UUID entryId) {
        return repository.findByIdAndInventoryEntryId(id, entryId).map(mapper::toDomain);
    }

    @Override
    public List<InventoryEntryDocument> findAllByEntryId(UUID entryId) {
        return mapper.toDomainList(repository.findAllByInventoryEntryIdOrderByUploadedAtAsc(entryId));
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
