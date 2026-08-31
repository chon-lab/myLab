package com.mylab.backend.person.application.usecase;

import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.person.application.exception.PersonNotFoundException;
import com.mylab.backend.person.application.port.in.GetPersonPort;
import com.mylab.backend.person.application.port.out.PersonRepositoryPort;
import com.mylab.backend.person.domain.model.Person;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GetPersonByIdUsecase implements GetPersonPort {

    private final PersonRepositoryPort repositoryPort;

    @Override
    @Transactional(readOnly = true)
    public Person get(UUID id) {
        Objects.requireNonNull(id, "id must not be null");
        log.debug("Getting person with ID: {}", id);
        return repositoryPort.findById(id)
        .orElseThrow(() ->
            new PersonNotFoundException(id)
        );
    }

}
