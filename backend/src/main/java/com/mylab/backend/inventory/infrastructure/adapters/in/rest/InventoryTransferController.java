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
import com.mylab.backend.inventory.application.dto.InventoryTransferHistoryRecord;
import com.mylab.backend.inventory.application.dto.InventoryTransferSearchCriteria;
import com.mylab.backend.inventory.application.port.in.CreateInventoryTransferPort;
import com.mylab.backend.inventory.application.port.in.GetInventoryTransferHistoryPort;
import com.mylab.backend.inventory.application.port.in.GetInventoryTransferPort;
import com.mylab.backend.inventory.application.port.in.ReverseInventoryTransferPort;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.CreateInventoryTransferRequest;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.ReverseInventoryTransferRequest;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.mapper.InventoryTransferRestMapper;

@RestController
@RequiredArgsConstructor
public class InventoryTransferController {
    private final CreateInventoryTransferPort createInventoryTransferPort;
    private final GetInventoryTransferHistoryPort getInventoryTransferHistoryPort;
    private final GetInventoryTransferPort getInventoryTransferPort;
    private final ReverseInventoryTransferPort reverseInventoryTransferPort;
    private final InventoryTransferRestMapper mapper;

    @GetMapping("/api/v1/inventory/transfers/{transferId}")
    public InventoryTransferHistoryRecord getById(@PathVariable UUID transferId) {
        return getInventoryTransferPort.get(transferId);
    }

    @PostMapping("/api/v1/inventory/transfers/{transferId}/reverse")
    public ResponseEntity<Void> reverse(
            @PathVariable UUID transferId,
            @Valid @RequestBody ReverseInventoryTransferRequest request
    ) {
        reverseInventoryTransferPort.reverse(transferId, mapper.toInput(request));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/v1/research-groups/{groupId}/inventory/transfers")
    public List<InventoryTransferHistoryRecord> getHistory(
            @PathVariable UUID groupId,
            @RequestParam(required = false) UUID sourceLaboratoryId,
            @RequestParam(required = false) UUID destinationLaboratoryId,
            @RequestParam(required = false) UUID inventoryItemId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo
    ) {
        InventoryTransferSearchCriteria criteria = new InventoryTransferSearchCriteria(
                sourceLaboratoryId,
                destinationLaboratoryId,
                inventoryItemId,
                dateFrom,
                dateTo
        );
        return getInventoryTransferHistoryPort.getHistory(groupId, criteria);
    }

    @PostMapping("/api/v1/research-groups/{groupId}/inventory/transfers")
    public ResponseEntity<Void> create(
            @PathVariable UUID groupId,
            @Valid @RequestBody CreateInventoryTransferRequest request
    ) {
        UUID transferId = createInventoryTransferPort.create(groupId, mapper.toInput(request));
        return ResponseEntity.created(URI.create("/api/v1/inventory/transfers/" + transferId)).build();
    }
}

