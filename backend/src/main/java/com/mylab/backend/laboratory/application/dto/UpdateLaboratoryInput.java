package com.mylab.backend.laboratory.application.dto;

import com.mylab.backend.laboratory.domain.valueobject.LaboratoryAddress;

public record UpdateLaboratoryInput(String name, LaboratoryAddress address) {}
