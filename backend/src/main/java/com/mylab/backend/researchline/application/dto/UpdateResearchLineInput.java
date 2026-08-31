package com.mylab.backend.researchline.application.dto;

import java.util.List;

public record UpdateResearchLineInput(
        String name,
        String objective,
        List<String> keywords,
        List<String> knowledgeAreas,
        List<String> applicationSectors
) {}
