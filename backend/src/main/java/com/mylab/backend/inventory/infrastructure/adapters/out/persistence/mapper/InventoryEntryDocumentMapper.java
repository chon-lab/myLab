package com.mylab.backend.inventory.infrastructure.adapters.out.persistence.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import com.mylab.backend.inventory.domain.model.InventoryEntryDocument;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryEntryDocumentEntity;

@Component
public class InventoryEntryDocumentMapper {
    public InventoryEntryDocument toDomain(InventoryEntryDocumentEntity entity) {
        return new InventoryEntryDocument(entity.getId(), entity.getInventoryEntryId(), entity.getDocumentNumber(),
                entity.getIssuer(), entity.getDocumentDate(), entity.getFileName(), entity.getStoredPath(),
                entity.getContentType(), entity.getSizeBytes(), entity.getChecksumSha256(), entity.getUploadedAt());
    }

    public InventoryEntryDocumentEntity toEntity(InventoryEntryDocument document) {
        return InventoryEntryDocumentEntity.builder()
                .id(document.id()).inventoryEntryId(document.inventoryEntryId())
                .documentNumber(document.documentNumber()).issuer(document.issuer())
                .documentDate(document.documentDate()).fileName(document.fileName())
                .storedPath(document.storedPath()).contentType(document.contentType())
                .sizeBytes(document.sizeBytes()).checksumSha256(document.checksumSha256())
                .uploadedAt(document.uploadedAt()).build();
    }

    public List<InventoryEntryDocument> toDomainList(List<InventoryEntryDocumentEntity> entities) {
        return entities.stream().map(this::toDomain).toList();
    }
}
