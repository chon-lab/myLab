package com.mylab.backend.laboratory.application.port.in;

import java.util.UUID;

import com.mylab.backend.laboratory.application.dto.UpdateLaboratoryInput;

public interface UpdateLaboratoryPort {
    void update(UUID id, UpdateLaboratoryInput input);
}
