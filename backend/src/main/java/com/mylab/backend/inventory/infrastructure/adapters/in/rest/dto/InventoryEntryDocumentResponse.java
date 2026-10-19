package com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record InventoryEntryDocumentResponse(
        UUID id,
        String documentNumber,
        String issuer,
        LocalDate documentDate,
        String fileName,
        String contentType,
        Long sizeBytes,
        String checksumSha256,
        LocalDateTime uploadedAt,
        boolean fileAvailable
) {
}
