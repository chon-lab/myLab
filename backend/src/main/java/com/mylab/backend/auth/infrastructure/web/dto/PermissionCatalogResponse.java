package com.mylab.backend.auth.infrastructure.web.dto;

import java.util.List;

public record PermissionCatalogResponse(
        List<String> resources,
        List<String> actions
) {}
