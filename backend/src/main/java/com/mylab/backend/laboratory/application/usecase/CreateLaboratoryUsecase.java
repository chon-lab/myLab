package com.mylab.backend.laboratory.application.usecase;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.laboratory.application.dto.CreateLaboratoryInput;
import com.mylab.backend.laboratory.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.laboratory.application.port.in.CreateLaboratoryPort;
import com.mylab.backend.laboratory.application.port.out.LaboratoryRepositoryPort;
import com.mylab.backend.laboratory.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.laboratory.domain.model.Laboratory;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreateLaboratoryUsecase implements CreateLaboratoryPort {

    private final LaboratoryRepositoryPort repositoryPort;
    private final ResearchGroupLookupPort researchGroupLookupPort;

    @Override
    @Transactional
    public UUID create(CreateLaboratoryInput input) {
        Objects.requireNonNull(input, "input must not be null");
        Objects.requireNonNull(input.researchGroupId(), "researchGroupId must not be null");
        log.info("Creating laboratory for research group: {}", input.researchGroupId());

        if (!researchGroupLookupPort.existsById(input.researchGroupId())) {
            throw new ResearchGroupNotFoundException(input.researchGroupId());
        }

        LocalDateTime now = LocalDateTime.now();
        Laboratory laboratory = Laboratory.builder()
                .id(UUID.randomUUID())
                .researchGroupId(input.researchGroupId())
                .name(input.name())
                .address(input.address())
                .createdAt(now)
                .updatedAt(now)
                .build();

        repositoryPort.save(laboratory);
        log.info("Laboratory created successfully with ID: {}", laboratory.getId());
        return laboratory.getId();
    }
}
