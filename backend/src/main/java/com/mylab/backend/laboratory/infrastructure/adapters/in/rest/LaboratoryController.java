package com.mylab.backend.laboratory.infrastructure.adapters.in.rest;

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

import com.mylab.backend.laboratory.application.port.in.CreateLaboratoryPort;
import com.mylab.backend.laboratory.application.port.in.DeleteLaboratoryPort;
import com.mylab.backend.laboratory.application.port.in.GetAllLaboratoriesPort;
import com.mylab.backend.laboratory.application.port.in.GetLaboratoryPort;
import com.mylab.backend.laboratory.application.port.in.UpdateLaboratoryPort;
import com.mylab.backend.laboratory.infrastructure.adapters.in.rest.dto.CreateLaboratoryRequest;
import com.mylab.backend.laboratory.infrastructure.adapters.in.rest.dto.LaboratoryResponse;
import com.mylab.backend.laboratory.infrastructure.adapters.in.rest.dto.UpdateLaboratoryRequest;
import com.mylab.backend.laboratory.infrastructure.adapters.in.rest.mapper.LaboratoryRestMapper;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
public class LaboratoryController {

    private final CreateLaboratoryPort createLaboratoryPort;
    private final UpdateLaboratoryPort updateLaboratoryPort;
    private final DeleteLaboratoryPort deleteLaboratoryPort;
    private final GetLaboratoryPort getLaboratoryPort;
    private final GetAllLaboratoriesPort getAllLaboratoriesPort;
    private final LaboratoryRestMapper mapper;

    @GetMapping("/api/v1/research-groups/{researchGroupId}/laboratories")
    public List<LaboratoryResponse> getAllLaboratoriesByGroup(@PathVariable UUID researchGroupId) {
        return mapper.toResponseList(getAllLaboratoriesPort.getAllByResearchGroup(researchGroupId));
    }

    @PostMapping("/api/v1/research-groups/{researchGroupId}/laboratories")
    public ResponseEntity<Void> createLaboratory(
            @PathVariable UUID researchGroupId,
            @Valid @RequestBody CreateLaboratoryRequest request) {
        UUID id = createLaboratoryPort.create(mapper.toInput(researchGroupId, request));
        return ResponseEntity.created(URI.create("/api/v1/laboratories/" + id)).build();
    }

    @GetMapping("/api/v1/laboratories/{id}")
    public LaboratoryResponse getLaboratoryById(@PathVariable UUID id) {
        return mapper.toResponse(getLaboratoryPort.get(id));
    }

    @PutMapping("/api/v1/laboratories/{id}")
    public ResponseEntity<Void> updateLaboratory(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateLaboratoryRequest request) {
        updateLaboratoryPort.update(id, mapper.toInput(request));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/v1/laboratories/{id}")
    public ResponseEntity<Void> deleteLaboratory(@PathVariable UUID id) {
        deleteLaboratoryPort.delete(id);
        return ResponseEntity.noContent().build();
    }
}
