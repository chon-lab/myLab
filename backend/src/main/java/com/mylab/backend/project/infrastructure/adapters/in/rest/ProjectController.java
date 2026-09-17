package com.mylab.backend.project.infrastructure.adapters.in.rest;

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

import com.mylab.backend.project.application.port.in.CreateProjectPort;
import com.mylab.backend.project.application.port.in.DeleteProjectPort;
import com.mylab.backend.project.application.port.in.GetAllProjectsPort;
import com.mylab.backend.project.application.port.in.GetProjectPort;
import com.mylab.backend.project.application.port.in.UpdateProjectPort;
import com.mylab.backend.project.infrastructure.adapters.in.rest.dto.CreateProjectRequest;
import com.mylab.backend.project.infrastructure.adapters.in.rest.dto.ProjectResponse;
import com.mylab.backend.project.infrastructure.adapters.in.rest.dto.UpdateProjectRequest;
import com.mylab.backend.project.infrastructure.adapters.in.rest.mapper.ProjectRestMapper;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ProjectController {

    private final CreateProjectPort createProjectPort;
    private final UpdateProjectPort updateProjectPort;
    private final DeleteProjectPort deleteProjectPort;
    private final GetProjectPort getProjectPort;
    private final GetAllProjectsPort getAllProjectsPort;
    private final ProjectRestMapper mapper;

    @GetMapping("/api/v1/laboratories/{laboratoryId}/projects")
    public List<ProjectResponse> getAllProjectsByLaboratory(@PathVariable UUID laboratoryId) {
        log.info("REST GET: list projects for laboratory: {}", laboratoryId);
        return mapper.toResponseList(getAllProjectsPort.getAllByLaboratory(laboratoryId));
    }

    @PostMapping("/api/v1/laboratories/{laboratoryId}/projects")
    public ResponseEntity<Void> createProject(
            @PathVariable UUID laboratoryId,
            @Valid @RequestBody CreateProjectRequest request) {
        log.info("REST POST: create project for laboratory: {}", laboratoryId);
        UUID id = createProjectPort.create(mapper.toInput(laboratoryId, request));
        return ResponseEntity.created(URI.create("/api/v1/projects/" + id)).build();
    }

    @GetMapping("/api/v1/projects/{id}")
    public ProjectResponse getProjectById(@PathVariable UUID id) {
        log.info("REST GET: find project by ID: {}", id);
        return mapper.toResponse(getProjectPort.get(id));
    }

    @PutMapping("/api/v1/projects/{id}")
    public ResponseEntity<Void> updateProject(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProjectRequest request) {
        log.info("REST PUT: update project with ID: {}", id);
        updateProjectPort.update(id, mapper.toInput(request));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/v1/projects/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID id) {
        log.info("REST DELETE: delete project with ID: {}", id);
        deleteProjectPort.delete(id);
        return ResponseEntity.noContent().build();
    }
}
