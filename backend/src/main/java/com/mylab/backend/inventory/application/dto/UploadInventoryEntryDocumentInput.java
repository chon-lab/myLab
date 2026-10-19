package com.mylab.backend.inventory.application.dto;

import java.time.LocalDate;

public record UploadInventoryEntryDocumentInput(
        String documentNumber,
        String issuer,
        LocalDate documentDate,
        String fileName,
        String contentType,
        byte[] content
) {
    public UploadInventoryEntryDocumentInput {
        content = content.clone();
    }
}
