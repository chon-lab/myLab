package com.mylab.backend.role.application.port.in;

import java.util.UUID;

public interface DeleteRolePort {
    void delete(UUID id);
}
