package com.mylab.backend.inventory.domain.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record InventoryEntryDocument(
        UUID id,
        UUID inventoryEntryId,
        String documentNumber,
        String issuer,
        LocalDate documentDate,
        String fileName,
        String storedPath,
        String contentType,
        Long sizeBytes,
        String checksumSha256,
        LocalDateTime uploadedAt
) {
    public InventoryEntryDocument {
        if (id == null || inventoryEntryId == null || uploadedAt == null) {
            throw new IllegalArgumentException("Document id, entry id and creation date are required");
        }
        if (documentNumber != null && documentNumber.length() > 100) {
            throw new IllegalArgumentException("documentNumber must not exceed 100 characters");
        }
        if (issuer != null && issuer.length() > 255) {
            throw new IllegalArgumentException("issuer must not exceed 255 characters");
        }
        if (fileName == null) {
            if (storedPath != null || contentType != null || sizeBytes != null || checksumSha256 != null) {
                throw new IllegalArgumentException("File metadata must be supplied together");
            }
        } else if (storedPath == null || contentType == null || sizeBytes == null || sizeBytes <= 0
                || checksumSha256 == null || !checksumSha256.matches("[a-fA-F0-9]{64}")) {
            throw new IllegalArgumentException("Complete file metadata is required when a file is attached");
        }
    }

    public boolean hasFile() {
        return storedPath != null;
    }

    public InventoryEntryDocument withFile(
            String newFileName,
            String newStoredPath,
            String newContentType,
            long newSizeBytes,
            String newChecksumSha256
    ) {
        return new InventoryEntryDocument(id, inventoryEntryId, documentNumber, issuer, documentDate,
                newFileName, newStoredPath, newContentType, newSizeBytes, newChecksumSha256, uploadedAt);
    }
}
