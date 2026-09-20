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
import com.mylab.backend.inventory.application.dto.InventoryExitHistoryRecord;
import com.mylab.backend.inventory.application.dto.InventoryExitSearchCriteria;
import com.mylab.backend.inventory.application.port.in.CreateInventoryExitPort;
import com.mylab.backend.inventory.application.port.in.GetInventoryExitHistoryPort;
import com.mylab.backend.inventory.application.port.in.GetInventoryExitPort;
import com.mylab.backend.inventory.application.port.in.ReverseInventoryExitPort;
import com.mylab.backend.inventory.domain.model.InventoryExitType;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.CreateInventoryExitRequest;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.ReverseInventoryExitRequest;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.mapper.InventoryExitRestMapper;

@RestController
@RequiredArgsConstructor
public class InventoryExitController {
    private final CreateInventoryExitPort createInventoryExitPort;
    private final GetInventoryExitHistoryPort getInventoryExitHistoryPort;
    private final GetInventoryExitPort getInventoryExitPort;
    private final ReverseInventoryExitPort reverseInventoryExitPort;
    private final InventoryExitRestMapper mapper;

    @GetMapping("/api/v1/inventory/exits/{exitId}")
    public InventoryExitHistoryRecord getById(@PathVariable UUID exitId) {
        return getInventoryExitPort.get(exitId);
    }

    @PostMapping("/api/v1/inventory/exits/{exitId}/reverse")
    public ResponseEntity<Void> reverse(
            @PathVariable UUID exitId,
            @Valid @RequestBody ReverseInventoryExitRequest request
    ) {
        reverseInventoryExitPort.reverse(exitId, mapper.toInput(request));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/v1/research-groups/{groupId}/inventory/exits")
    public List<InventoryExitHistoryRecord> getHistory(
            @PathVariable UUID groupId,
            @RequestParam(required = false) UUID laboratoryId,
            @RequestParam(required = false) InventoryExitType type,
            @RequestParam(required = false) UUID inventoryItemId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo
    ) {
        InventoryExitSearchCriteria criteria = new InventoryExitSearchCriteria(
                laboratoryId,
                type,
                inventoryItemId,
                dateFrom,
                dateTo
        );
        return getInventoryExitHistoryPort.getHistory(groupId, criteria);
    }

    @PostMapping("/api/v1/research-groups/{groupId}/inventory/exits")
    public ResponseEntity<Void> create(
            @PathVariable UUID groupId,
            @Valid @RequestBody CreateInventoryExitRequest request
    ) {
        UUID exitId = createInventoryExitPort.create(groupId, mapper.toInput(request));
        return ResponseEntity.created(URI.create("/api/v1/inventory/exits/" + exitId)).build();
    }
}

