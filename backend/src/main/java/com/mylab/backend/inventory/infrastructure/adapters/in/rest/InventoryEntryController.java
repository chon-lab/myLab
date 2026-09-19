package com.mylab.backend.inventory.infrastructure.adapters.in.rest;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.InventoryEntryHistoryRecord;
import com.mylab.backend.inventory.application.dto.InventoryEntrySearchCriteria;
import com.mylab.backend.inventory.application.port.in.CreateInventoryEntryPort;
import com.mylab.backend.inventory.application.port.in.GetInventoryEntryHistoryPort;
import com.mylab.backend.inventory.domain.model.InventoryEntrySource;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.CreateInventoryEntryRequest;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.mapper.InventoryEntryRestMapper;

@RestController
@RequiredArgsConstructor
public class InventoryEntryController {
    private final CreateInventoryEntryPort createInventoryEntryPort;
    private final GetInventoryEntryHistoryPort getInventoryEntryHistoryPort;
    private final InventoryEntryRestMapper mapper;

    @GetMapping("/api/v1/research-groups/{groupId}/inventory/entries")
    public List<InventoryEntryHistoryRecord> getHistory(
            @PathVariable UUID groupId,
            @RequestParam(required = false) UUID laboratoryId,
            @RequestParam(required = false) InventoryEntrySource source,
            @RequestParam(required = false) UUID inventoryItemId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo
    ) {
        InventoryEntrySearchCriteria criteria = new InventoryEntrySearchCriteria(
                laboratoryId,
                source,
                inventoryItemId,
                dateFrom,
                dateTo
        );
        return getInventoryEntryHistoryPort.getHistory(groupId, criteria);
    }

    @PostMapping("/api/v1/research-groups/{groupId}/inventory/entries")
    public ResponseEntity<Void> create(
            @PathVariable UUID groupId,
            @Valid @RequestBody CreateInventoryEntryRequest request
    ) {
        UUID entryId = createInventoryEntryPort.create(groupId, mapper.toInput(request));
        return ResponseEntity.created(URI.create("/api/v1/inventory/entries/" + entryId)).build();
    }
}
