package com.mylab.backend.researchline.infrastructure.adapters.in.rest.mapper;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.mylab.backend.researchline.application.dto.CreateResearchLineInput;
import com.mylab.backend.researchline.application.dto.UpdateResearchLineInput;
import com.mylab.backend.researchline.domain.model.ResearchLine;
import com.mylab.backend.researchline.infrastructure.adapters.in.rest.dto.CreateResearchLineRequest;
import com.mylab.backend.researchline.infrastructure.adapters.in.rest.dto.ResearchLineResponse;
import com.mylab.backend.researchline.infrastructure.adapters.in.rest.dto.UpdateResearchLineRequest;

@Component
public class ResearchLineRestMapper {

    public CreateResearchLineInput toInput(UUID researchGroupId, CreateResearchLineRequest request) {
        return new CreateResearchLineInput(
                researchGroupId,
                request.getName(),
                request.getObjective(),
                request.getKeywords(),
                request.getKnowledgeAreas(),
                request.getApplicationSectors()
        );
    }

    public UpdateResearchLineInput toInput(UpdateResearchLineRequest request) {
        return new UpdateResearchLineInput(
                request.getName(),
                request.getObjective(),
                request.getKeywords(),
                request.getKnowledgeAreas(),
                request.getApplicationSectors()
        );
    }

    public ResearchLineResponse toResponse(ResearchLine domain) {
        if (domain == null) {
            return null;
        }

        return new ResearchLineResponse(
                domain.getId(),
                domain.getResearchGroupId(),
                domain.getName(),
                domain.getObjective(),
                domain.getKeywords(),
                domain.getKnowledgeAreas(),
                domain.getApplicationSectors(),
                domain.getCreatedAt(),
                domain.getUpdatedAt()
        );
    }

    public List<ResearchLineResponse> toResponseList(List<ResearchLine> domains) {
        if (domains == null) {
            return List.of();
        }

        return domains.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}
