package com.mylab.backend.laboratory.application.port.in;

import java.util.UUID;

import com.mylab.backend.laboratory.domain.model.Laboratory;

public interface GetLaboratoryPort {
    Laboratory get(UUID id);
}
