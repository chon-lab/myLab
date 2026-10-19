package com.mylab.backend.inventory.application.dto;

import org.springframework.core.io.Resource;

public record InventoryEntryDocumentContent(String fileName, String contentType, long sizeBytes, Resource resource) {
}
