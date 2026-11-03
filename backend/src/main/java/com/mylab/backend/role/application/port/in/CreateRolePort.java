package com.mylab.backend.role.application.port.in;

import java.util.UUID;

import com.mylab.backend.role.application.dto.CreateRoleInput;

public interface CreateRolePort {
    UUID create(CreateRoleInput input);
}
