package com.mylab.backend.laboratory.application.dto;

import java.util.UUID;

import com.mylab.backend.laboratory.domain.valueobject.LaboratoryAddress;

public record CreateLaboratoryInput(UUID researchGroupId, String name, LaboratoryAddress address) {}
