package com.mylab.backend.laboratory.application.port.in;

import java.util.UUID;

import com.mylab.backend.laboratory.application.dto.CreateLaboratoryInput;

public interface CreateLaboratoryPort {
    UUID create(CreateLaboratoryInput input);
}
