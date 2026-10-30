package com.mylab.backend.auth.infrastructure.web;

import java.util.Arrays;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mylab.backend.auth.infrastructure.web.dto.PermissionCatalogResponse;
import com.mylab.backend.role.domain.model.PermissionAction;
import com.mylab.backend.role.domain.model.PermissionResource;

@RestController
public class PermissionCatalogController {

    @GetMapping("/api/v1/permissions/catalog")
    public PermissionCatalogResponse catalog() {
        List<String> resources = Arrays.stream(PermissionResource.values()).map(Enum::name).toList();
        List<String> actions = Arrays.stream(PermissionAction.values()).map(Enum::name).toList();
        return new PermissionCatalogResponse(resources, actions);
    }
}
