package com.mylab.backend.inventory.application.dto;

import java.time.LocalDate;

public record CreateInventoryEntryDocumentInput(String documentNumber, String issuer, LocalDate documentDate) {
}
