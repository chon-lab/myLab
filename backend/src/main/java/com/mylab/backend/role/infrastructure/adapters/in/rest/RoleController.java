package com.mylab.backend.role.infrastructure.adapters.in.rest;

import com.mylab.backend.auth.infrastructure.web.RequiredPermission;
import com.mylab.backend.role.domain.model.PermissionResource;

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

import com.mylab.backend.role.application.port.in.CreateRolePort;
import com.mylab.backend.role.application.port.in.DeleteRolePort;
import com.mylab.backend.role.application.port.in.GetRolesPort;
import com.mylab.backend.role.application.port.in.UpdateRolePort;
import com.mylab.backend.role.infrastructure.adapters.in.rest.dto.CreateRoleRequest;
import com.mylab.backend.role.infrastructure.adapters.in.rest.dto.RoleResponse;
import com.mylab.backend.role.infrastructure.adapters.in.rest.dto.UpdateRoleRequest;
import com.mylab.backend.role.infrastructure.adapters.in.rest.mapper.RoleRestMapper;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredPermission(resource = PermissionResource.ROLE)
@RequestMapping("/api/v1/research-groups/{researchGroupId}/roles")
@RequiredArgsConstructor
@Slf4j
public class RoleController {

    private final CreateRolePort createRolePort;
    private final GetRolesPort getRolesPort;
    private final UpdateRolePort updateRolePort;
    private final DeleteRolePort deleteRolePort;
    private final RoleRestMapper mapper;

    @GetMapping
    public List<RoleResponse> getRoles(@PathVariable UUID researchGroupId) {
        log.info("REST GET: list roles for research group {}", researchGroupId);
        return mapper.toResponseList(getRolesPort.getByResearchGroup(researchGroupId));
    }

    @PostMapping
    public ResponseEntity<Void> createRole(
            @PathVariable UUID researchGroupId,
            @Valid @RequestBody CreateRoleRequest request) {
        UUID id = createRolePort.create(mapper.toInput(researchGroupId, request));
        URI location = URI.create("/api/v1/research-groups/" + researchGroupId + "/roles/" + id);
        return ResponseEntity.created(location).build();
    }

    @GetMapping("/{roleId}")
    public RoleResponse getRole(@PathVariable UUID researchGroupId, @PathVariable UUID roleId) {
        log.info("REST GET: role {} in research group {}", roleId, researchGroupId);
        return mapper.toResponse(getRolesPort.get(roleId));
    }

    @PutMapping("/{roleId}")
    public ResponseEntity<Void> updateRole(
            @PathVariable UUID researchGroupId,
            @PathVariable UUID roleId,
            @Valid @RequestBody UpdateRoleRequest request) {
        updateRolePort.update(roleId, mapper.toInput(request));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{roleId}")
    public ResponseEntity<Void> deleteRole(
            @PathVariable UUID researchGroupId,
            @PathVariable UUID roleId) {
        deleteRolePort.delete(roleId);
        return ResponseEntity.noContent().build();
    }
}
