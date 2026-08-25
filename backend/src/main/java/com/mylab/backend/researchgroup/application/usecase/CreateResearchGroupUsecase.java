package com.mylab.backend.researchgroup.application.usecase;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.researchgroup.application.dto.CreateResearchGroupInput;
import com.mylab.backend.researchgroup.application.port.in.CreateResearchGroupPort;
import com.mylab.backend.researchgroup.application.port.out.ResearchGroupRepositoryPort;
import com.mylab.backend.researchgroup.domain.exception.DuplicateCnpqIdException;
import com.mylab.backend.researchgroup.domain.model.ResearchGroup;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreateResearchGroupUsecase implements CreateResearchGroupPort {

    private final ResearchGroupRepositoryPort repositoryPort;

    @Override
    @Transactional
    public UUID create(CreateResearchGroupInput input) {
        log.info("Creating research group with CNPq ID: {}", input.cnpqId());

        if (repositoryPort.existsByCnpqId(input.cnpqId())) {
            throw new DuplicateCnpqIdException(input.cnpqId());
        }

        LocalDateTime now = LocalDateTime.now();
        ResearchGroup researchGroup = ResearchGroup.builder()
                .id(UUID.randomUUID())
                .cnpqId(input.cnpqId())
                .name(input.name())
                .situation(input.situation())
                .formationYear(input.formationYear())
                .situationAt(input.situationAt())
                .lastSubmittedAt(input.lastSubmittedAt())
                .predominantArea(input.predominantArea())
                .institutionName(input.institutionName())
                .institutionUnit(input.institutionUnit())
                .sourceUrl(input.sourceUrl())
                .repercussions(input.repercussions())
                .address(input.address())
                .contact(input.contact())
                .createdAt(now)
                .updatedAt(now)
                .build();

        repositoryPort.save(researchGroup);
        log.info("Research group created successfully with ID: {}", researchGroup.getId());
        return researchGroup.getId();
    }
}
