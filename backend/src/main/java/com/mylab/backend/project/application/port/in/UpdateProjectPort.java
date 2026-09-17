package com.mylab.backend.project.application.port.in;

import java.util.UUID;

import com.mylab.backend.project.application.dto.UpdateProjectInput;

public interface UpdateProjectPort {
    void update(UUID id, UpdateProjectInput input);
}
