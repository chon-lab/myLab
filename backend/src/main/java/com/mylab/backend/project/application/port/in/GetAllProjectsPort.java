package com.mylab.backend.project.application.port.in;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.project.domain.model.Project;

public interface GetAllProjectsPort {
    List<Project> getAllByLaboratory(UUID laboratoryId);
}
