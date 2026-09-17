package com.mylab.backend.inventory.infrastructure.adapters.in.rest;

import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.port.in.*;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.*;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.mapper.InventoryRestMapper;

@RestController
@RequiredArgsConstructor
public class InventoryItemController {
    private final CreateInventoryItemPort createInventoryItemPort;
    private final UpdateInventoryItemPort updateInventoryItemPort;
    private final DeleteInventoryItemPort deleteInventoryItemPort;
    private final GetInventoryItemPort getInventoryItemPort;
    private final GetAllInventoryItemsPort getAllInventoryItemsPort;
    private final InventoryRestMapper mapper;

    @GetMapping("/api/v1/research-groups/{groupId}/inventory/items")
    public List<InventoryItemResponse> getAll(@PathVariable UUID groupId) {
        return mapper.toItemResponses(getAllInventoryItemsPort.getAllByResearchGroup(groupId));
    }

    @PostMapping("/api/v1/research-groups/{groupId}/inventory/items")
    public ResponseEntity<Void> create(
            @PathVariable UUID groupId,
            @Valid @RequestBody CreateInventoryItemRequest request
    ) {
        UUID id = createInventoryItemPort.create(groupId, mapper.toInput(request));
        return ResponseEntity.created(URI.create("/api/v1/inventory/items/" + id)).build();
    }

    @GetMapping("/api/v1/inventory/items/{id}")
    public InventoryItemResponse get(@PathVariable UUID id) {
        return mapper.toResponse(getInventoryItemPort.get(id));
    }

    @PutMapping("/api/v1/inventory/items/{id}")
    public ResponseEntity<Void> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateInventoryItemRequest request
    ) {
        updateInventoryItemPort.update(id, mapper.toInput(request));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/v1/inventory/items/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        deleteInventoryItemPort.delete(id);
        return ResponseEntity.noContent().build();
    }
}
