package com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "inventory_movement_document", indexes =
        @Index(name = "idx_inventory_movement_document_movement", columnList = "inventory_movement_id, uploaded_at"))
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InventoryEntryDocumentEntity {
    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "inventory_movement_id", nullable = false, updatable = false)
    private UUID inventoryEntryId;

    @Column(name = "document_number", length = 100)
    private String documentNumber;

    @Column(length = 255)
    private String issuer;

    @Column(name = "document_date")
    private LocalDate documentDate;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "stored_path", length = 500)
    private String storedPath;

    @Column(name = "content_type", length = 150)
    private String contentType;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Column(name = "checksum_sha256", length = 64)
    private String checksumSha256;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;
}
