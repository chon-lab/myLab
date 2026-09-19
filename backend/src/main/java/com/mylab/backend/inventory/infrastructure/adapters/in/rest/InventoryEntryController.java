package com.mylab.backend.inventory.infrastructure.adapters.in.rest;

import java.net.URI;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.port.in.CreateInventoryEntryPort;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.CreateInventoryEntryRequest;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.mapper.InventoryEntryRestMapper;

@RestController
@RequiredArgsConstructor
public class InventoryEntryController {
    private final CreateInventoryEntryPort createInventoryEntryPort;
    private final InventoryEntryRestMapper mapper;

    @PostMapping("/api/v1/research-groups/{groupId}/inventory/entries")
    public ResponseEntity<Void> create(
            @PathVariable UUID groupId,
            @Valid @RequestBody CreateInventoryEntryRequest request
    ) {
        UUID entryId = createInventoryEntryPort.create(groupId, mapper.toInput(request));
        return ResponseEntity.created(URI.create("/api/v1/inventory/entries/" + entryId)).build();
    }
}
