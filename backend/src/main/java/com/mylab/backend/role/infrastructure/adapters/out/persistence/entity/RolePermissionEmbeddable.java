package com.mylab.backend.role.infrastructure.adapters.out.persistence.entity;

import com.mylab.backend.role.domain.model.PermissionResource;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RolePermissionEmbeddable {

    @Enumerated(EnumType.STRING)
    @Column(name = "resource", nullable = false, length = 64)
    private PermissionResource resource;

    @Column(name = "can_read", nullable = false)
    private boolean canRead;

    @Column(name = "can_write", nullable = false)
    private boolean canWrite;

    @Column(name = "can_delete", nullable = false)
    private boolean canDelete;
}
