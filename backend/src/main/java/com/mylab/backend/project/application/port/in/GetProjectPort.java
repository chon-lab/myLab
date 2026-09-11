package com.mylab.backend.project.application.port.in;

import java.util.UUID;

import com.mylab.backend.project.domain.model.Project;

public interface GetProjectPort {
    Project get(UUID id);
}
