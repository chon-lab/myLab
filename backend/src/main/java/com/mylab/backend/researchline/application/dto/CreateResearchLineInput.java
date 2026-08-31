package com.mylab.backend.researchline.application.dto;

import java.util.List;
import java.util.UUID;

public record CreateResearchLineInput(
        UUID researchGroupId,
        String name,
        String objective,
        List<String> keywords,
        List<String> knowledgeAreas,
        List<String> applicationSectors
) {}
