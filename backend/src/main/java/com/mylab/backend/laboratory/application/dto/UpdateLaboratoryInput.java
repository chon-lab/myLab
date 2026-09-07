package com.mylab.backend.laboratory.application.dto;

import com.mylab.backend.laboratory.domain.model.LaboratoryStatus;
import com.mylab.backend.laboratory.domain.valueobject.LaboratoryAddress;

public record UpdateLaboratoryInput(
        String name,
        String description,
        LaboratoryStatus status,
        LaboratoryAddress address
) {}
