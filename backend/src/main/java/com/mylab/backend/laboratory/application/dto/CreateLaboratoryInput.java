package com.mylab.backend.laboratory.application.dto;

import java.util.UUID;

import com.mylab.backend.laboratory.domain.model.LaboratoryStatus;
import com.mylab.backend.laboratory.domain.valueobject.LaboratoryAddress;

public record CreateLaboratoryInput(
        UUID researchGroupId,
        String name,
        String description,
        LaboratoryStatus status,
        LaboratoryAddress address
) {}
