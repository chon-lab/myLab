package com.mylab.backend.researchline.application.usecase;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.researchline.application.dto.CreateResearchLineInput;
import com.mylab.backend.researchline.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.researchline.application.port.in.CreateResearchLinePort;
import com.mylab.backend.researchline.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.researchline.application.port.out.ResearchLineRepositoryPort;
import com.mylab.backend.researchline.domain.model.ResearchLine;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreateResearchLineUsecase implements CreateResearchLinePort {

    private final ResearchLineRepositoryPort repositoryPort;
    private final ResearchGroupLookupPort researchGroupLookupPort;

    @Override
    @Transactional
    public UUID create(CreateResearchLineInput input) {
        log.info("Creating research line for research group: {}", input.researchGroupId());

        if (!researchGroupLookupPort.existsById(input.researchGroupId())) {
            throw new ResearchGroupNotFoundException(input.researchGroupId());
        }

        LocalDateTime now = LocalDateTime.now();
        ResearchLine researchLine = ResearchLine.builder()
                .id(UUID.randomUUID())
                .researchGroupId(input.researchGroupId())
                .name(input.name())
                .objective(input.objective())
                .keywords(input.keywords())
                .knowledgeAreas(input.knowledgeAreas())
                .applicationSectors(input.applicationSectors())
                .createdAt(now)
                .updatedAt(now)
                .build();

        repositoryPort.save(researchLine);
        log.info("Research line created successfully with ID: {}", researchLine.getId());
        return researchLine.getId();
    }
}
