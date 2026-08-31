package com.mylab.backend.person.application.usecase;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.person.application.dto.CreatePersonInput;
import com.mylab.backend.person.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.person.application.exception.ResearchLineNotFoundException;
import com.mylab.backend.person.application.port.in.CreatePersonPort;
import com.mylab.backend.person.application.port.out.PersonRepositoryPort;
import com.mylab.backend.person.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.person.application.port.out.ResearchLineLookupPort;
import com.mylab.backend.person.domain.model.Person;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreatePersonUsecase implements CreatePersonPort {

    private final PersonRepositoryPort repositoryPort;
    private final ResearchGroupLookupPort researchGroupLookupPort;
    private final ResearchLineLookupPort researchLineLookupPort;

    @Override
    @Transactional
    public UUID create(CreatePersonInput input) {
        log.info("Creating person for research group: {}", input.researchGroupId());

        if (!researchGroupLookupPort.existsById(input.researchGroupId())) {
            throw new ResearchGroupNotFoundException(input.researchGroupId());
        }

        Set<UUID> researchLineIds = validateResearchLineIds(input.researchLineIds(), input.researchGroupId());

        LocalDateTime now = LocalDateTime.now();
        Person person = Person.builder()
                .id(UUID.randomUUID())
                .researchGroupId(input.researchGroupId())
                .name(input.name())
                .socialName(input.socialName())
                .email(input.email())
                .phone(input.phone())
                .cpf(input.cpf())
                .academicDegree(input.academicDegree())
                .areasOfExpertise(input.areasOfExpertise())
                .researchLineIds(researchLineIds)
                .createdAt(now)
                .updatedAt(now)
                .build();

        repositoryPort.save(person);
        log.info("Person created successfully with ID: {}", person.getId());
        return person.getId();
    }

    private Set<UUID> validateResearchLineIds(List<UUID> researchLineIds, UUID researchGroupId) {
        if (researchLineIds == null) {
            return Set.of();
        }

        for (UUID researchLineId : researchLineIds) {
            if (!researchLineLookupPort.existsByIdAndResearchGroupId(researchLineId, researchGroupId)) {
                throw new ResearchLineNotFoundException(researchLineId);
            }
        }

        return Set.copyOf(researchLineIds);
    }
}
