package com.mylab.backend.inventory.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.mylab.backend.inventory.domain.model.InventoryEntryDocument;

public interface InventoryEntryDocumentRepositoryPort {
    void save(InventoryEntryDocument document);
    Optional<InventoryEntryDocument> findByIdAndEntryId(UUID id, UUID entryId);
    List<InventoryEntryDocument> findAllByEntryId(UUID entryId);
    void deleteById(UUID id);
}
