package com.mylab.backend.person.application.usecase;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.person.application.dto.UpdatePersonInput;
import com.mylab.backend.person.application.exception.PersonNotFoundException;
import com.mylab.backend.person.application.port.in.UpdatePersonPort;
import com.mylab.backend.person.application.port.out.PersonRepositoryPort;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UpdatePersonUsecase implements UpdatePersonPort {

    private final PersonRepositoryPort repositoryPort;

    @Override
    @Transactional
    public void update(UUID id, UpdatePersonInput input) {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(input, "input must not be null");
        log.info("Updating person with ID: {}", id);

        var person = repositoryPort.findById(id)
        .orElseThrow(() ->
            new PersonNotFoundException(id)
        );

        person.updateDetails(
            input.name(),
            input.socialName(),
            input.email(),
            input.phone(),
            input.cpf(),
            input.academicDegree(),
            input.areasOfExpertise(),
            LocalDateTime.now()
        );

        repositoryPort.save(person);
        log.info("Person updated successfully with ID: {}", id);
    }
}
