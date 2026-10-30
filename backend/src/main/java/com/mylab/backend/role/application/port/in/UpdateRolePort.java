package com.mylab.backend.role.application.port.in;

import java.util.UUID;

import com.mylab.backend.role.application.dto.UpdateRoleInput;

public interface UpdateRolePort {
    void update(UUID id, UpdateRoleInput input);
}
