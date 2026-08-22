package com.mylab.backend.researchgroup.application.dto;

import java.time.LocalDateTime;

import com.mylab.backend.researchgroup.domain.valueobjects.GroupAddress;
import com.mylab.backend.researchgroup.domain.valueobjects.GroupContact;

public record CreateResearchGroupInput(
        String cnpqId,
        String name,
        String situation,
        int formationYear,
        LocalDateTime situationAt,
        LocalDateTime lastSubmittedAt,
        String predominantArea,
        String institutionName,
        String institutionUnit,
        String sourceUrl,
        String repercussions,
        GroupAddress address,
        GroupContact contact
) {}
