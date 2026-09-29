package com.mylab.backend.person.application.usecase;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.groupmember.application.dto.CreateGroupMemberInput;
import com.mylab.backend.groupmember.application.port.in.CreateGroupMemberPort;
import com.mylab.backend.person.application.dto.CreatePersonInput;
import com.mylab.backend.person.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.person.application.port.in.CreatePersonPort;
import com.mylab.backend.person.application.port.out.PersonRepositoryPort;
import com.mylab.backend.person.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.person.domain.model.Person;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreatePersonUsecase implements CreatePersonPort {

    private final PersonRepositoryPort repositoryPort;
    private final ResearchGroupLookupPort researchGroupLookupPort;
    private final CreateGroupMemberPort createGroupMemberPort;

    @Override
    @Transactional
    public UUID create(CreatePersonInput input) {
        log.info("Creating person for research group: {}", input.researchGroupId());

        if (!researchGroupLookupPort.existsById(input.researchGroupId())) {
            throw new ResearchGroupNotFoundException(input.researchGroupId());
        }

        LocalDateTime now = LocalDateTime.now();
        Person person = Person.builder()
                .id(UUID.randomUUID())
                .name(input.name())
                .socialName(input.socialName())
                .email(input.email())
                .phone(input.phone())
                .cpf(input.cpf())
                .academicDegree(input.academicDegree())
                .areasOfExpertise(input.areasOfExpertise())
                .createdAt(now)
                .updatedAt(now)
                .build();

        repositoryPort.save(person);

        createGroupMemberPort.create(new CreateGroupMemberInput(
                input.researchGroupId(),
                person.getId(),
                input.researchLineIds()
        ));

        log.info("Person created successfully with ID: {}", person.getId());
        return person.getId();
    }
}
