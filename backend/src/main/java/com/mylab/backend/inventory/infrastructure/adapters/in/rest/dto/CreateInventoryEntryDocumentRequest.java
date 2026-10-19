package com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Size;

public record CreateInventoryEntryDocumentRequest(
        @Size(max = 100) String documentNumber,
        @Size(max = 255) String issuer,
        LocalDate documentDate
) {
}
