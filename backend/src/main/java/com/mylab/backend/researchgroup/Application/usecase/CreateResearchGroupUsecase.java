package com.mylab.backend.researchgroup.application.usecase;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import com.mylab.backend.researchgroup.application.dto.CreateResearchGroupInput;
import com.mylab.backend.researchgroup.application.port.in.CreateResearchGroupPort;
import com.mylab.backend.researchgroup.application.port.out.ResearchGroupRepositoryPort;
import com.mylab.backend.researchgroup.domain.exception.DuplicateCnpqIdException;
import com.mylab.backend.researchgroup.domain.model.ResearchGroup;

public class CreateResearchGroupUsecase implements CreateResearchGroupPort {

    private final ResearchGroupRepositoryPort repository;

    public CreateResearchGroupUsecase(ResearchGroupRepositoryPort repository) {
        this.repository = Objects.requireNonNull(repository, "repository must not be null");
    }

    @Override
    public UUID create(CreateResearchGroupInput input) {
        Objects.requireNonNull(input, "input must not be null");

        if (repository.existsByCnpqId(input.cnpqId())) {
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

        ResearchGroup savedResearchGroup = repository.save(researchGroup);
        return savedResearchGroup.getId();
    }
}
