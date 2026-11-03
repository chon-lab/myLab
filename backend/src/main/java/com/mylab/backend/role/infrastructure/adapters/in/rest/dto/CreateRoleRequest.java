package com.mylab.backend.role.infrastructure.adapters.in.rest.dto;

import java.util.ArrayList;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateRoleRequest {

    @NotBlank
    private String name;

    @Valid
    private List<RolePermissionDto> permissions = new ArrayList<>();
}
