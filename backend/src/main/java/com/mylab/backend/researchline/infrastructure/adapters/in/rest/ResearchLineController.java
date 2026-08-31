package com.mylab.backend.researchline.infrastructure.adapters.in.rest;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mylab.backend.researchline.application.port.in.CreateResearchLinePort;
import com.mylab.backend.researchline.application.port.in.DeleteResearchLinePort;
import com.mylab.backend.researchline.application.port.in.GetAllResearchLinePort;
import com.mylab.backend.researchline.application.port.in.GetResearchLinePort;
import com.mylab.backend.researchline.application.port.in.UpdateResearchLinePort;
import com.mylab.backend.researchline.infrastructure.adapters.in.rest.dto.CreateResearchLineRequest;
import com.mylab.backend.researchline.infrastructure.adapters.in.rest.dto.ResearchLineResponse;
import com.mylab.backend.researchline.infrastructure.adapters.in.rest.dto.UpdateResearchLineRequest;
import com.mylab.backend.researchline.infrastructure.adapters.in.rest.mapper.ResearchLineRestMapper;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ResearchLineController {

    private final CreateResearchLinePort createResearchLinePort;
    private final UpdateResearchLinePort updateResearchLinePort;
    private final DeleteResearchLinePort deleteResearchLinePort;
    private final GetResearchLinePort getResearchLinePort;
    private final GetAllResearchLinePort getAllResearchLinePort;
    private final ResearchLineRestMapper mapper;

    @GetMapping("/api/v1/research-groups/{researchGroupId}/research-lines")
    public List<ResearchLineResponse> getAllResearchLinesByGroup(@PathVariable UUID researchGroupId) {
        log.info("REST GET: list research lines for research group: {}", researchGroupId);
        return mapper.toResponseList(getAllResearchLinePort.getAllByResearchGroup(researchGroupId));
    }

    @PostMapping("/api/v1/research-groups/{researchGroupId}/research-lines")
    public ResponseEntity<Void> createResearchLine(
            @PathVariable UUID researchGroupId,
            @Valid @RequestBody CreateResearchLineRequest request) {
        UUID id = createResearchLinePort.create(mapper.toInput(researchGroupId, request));
        URI location = URI.create("/api/v1/research-lines/" + id);

        log.info("REST POST: create research line for research group: {}", researchGroupId);

        return ResponseEntity.created(location).build();
    }

    @GetMapping("/api/v1/research-lines/{id}")
    public ResearchLineResponse getResearchLineById(@PathVariable UUID id) {
        log.info("REST GET: find research line by ID: {}", id);
        return mapper.toResponse(getResearchLinePort.get(id));
    }

    @PutMapping("/api/v1/research-lines/{id}")
    public ResponseEntity<Void> updateResearchLine(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateResearchLineRequest request
    ) {
        log.info("REST PUT: update research line with ID: {}", id);
        updateResearchLinePort.update(id, mapper.toInput(request));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/v1/research-lines/{id}")
    public ResponseEntity<Void> deleteResearchLine(@PathVariable UUID id) {
        log.info("REST DELETE: delete research line with ID: {}", id);
        deleteResearchLinePort.delete(id);
        return ResponseEntity.noContent().build();
    }
}
