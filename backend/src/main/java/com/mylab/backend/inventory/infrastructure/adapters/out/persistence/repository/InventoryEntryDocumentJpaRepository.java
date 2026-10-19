package com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryEntryDocumentEntity;

public interface InventoryEntryDocumentJpaRepository extends JpaRepository<InventoryEntryDocumentEntity, UUID> {
    Optional<InventoryEntryDocumentEntity> findByIdAndInventoryEntryId(UUID id, UUID inventoryEntryId);
    List<InventoryEntryDocumentEntity> findAllByInventoryEntryIdOrderByUploadedAtAsc(UUID inventoryEntryId);
}
