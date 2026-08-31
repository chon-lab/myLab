package com.mylab.backend.researchline.infrastructure.adapters.in.rest.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResearchLineResponse {

    private UUID id;
    private UUID researchGroupId;
    private String name;
    private String objective;
    private List<String> keywords;
    private List<String> knowledgeAreas;
    private List<String> applicationSectors;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
