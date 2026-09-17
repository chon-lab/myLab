package com.mylab.backend.project.application.port.in;

import java.util.UUID;

import com.mylab.backend.project.application.dto.CreateProjectInput;

public interface CreateProjectPort {
    UUID create(CreateProjectInput input);
}
