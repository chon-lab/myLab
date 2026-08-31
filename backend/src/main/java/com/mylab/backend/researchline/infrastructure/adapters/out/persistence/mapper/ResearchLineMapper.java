package com.mylab.backend.researchline.infrastructure.adapters.out.persistence.mapper;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.mylab.backend.researchline.domain.model.ResearchLine;
import com.mylab.backend.researchline.infrastructure.adapters.out.persistence.entity.ResearchLineEntity;

@Component
public class ResearchLineMapper {

    public ResearchLine toDomain(ResearchLineEntity entity) {
        if (entity == null) {
            return null;
        }

        return ResearchLine.builder()
                .id(entity.getId())
                .researchGroupId(entity.getResearchGroupId())
                .name(entity.getName())
                .objective(entity.getObjective())
                .keywords(entity.getKeywords())
                .knowledgeAreas(entity.getKnowledgeAreas())
                .applicationSectors(entity.getApplicationSectors())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .deletedAt(entity.getDeletedAt())
                .build();
    }

    public ResearchLineEntity toEntity(ResearchLine domain) {
        if (domain == null) {
            return null;
        }

        return ResearchLineEntity.builder()
                .id(domain.getId())
                .researchGroupId(domain.getResearchGroupId())
                .name(domain.getName())
                .objective(domain.getObjective())
                .keywords(new ArrayList<>(domain.getKeywords()))
                .knowledgeAreas(new ArrayList<>(domain.getKnowledgeAreas()))
                .applicationSectors(new ArrayList<>(domain.getApplicationSectors()))
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .deletedAt(domain.getDeletedAt())
                .build();
    }

    public List<ResearchLine> toDomainList(List<ResearchLineEntity> entities) {
        if (entities == null) {
            return List.of();
        }

        return entities.stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }
}
