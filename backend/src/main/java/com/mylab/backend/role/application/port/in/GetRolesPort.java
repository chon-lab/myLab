package com.mylab.backend.role.application.port.in;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.role.domain.model.Role;

public interface GetRolesPort {
    List<Role> getByResearchGroup(UUID researchGroupId);
    Role get(UUID id);
}
