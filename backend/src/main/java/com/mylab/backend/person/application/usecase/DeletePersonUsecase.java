package com.mylab.backend.person.application.usecase;

import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.person.application.exception.PersonNotFoundException;
import com.mylab.backend.person.application.port.in.DeletePersonPort;
import com.mylab.backend.person.application.port.out.PersonRepositoryPort;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeletePersonUsecase implements DeletePersonPort {

    private final PersonRepositoryPort repositoryPort;

    @Override
    @Transactional
    public void delete(UUID id) {
        Objects.requireNonNull(id, "id must not be null");
        log.info("Deleting person with ID: {}", id);

       if (repositoryPort.findById(id).isEmpty()) {
            throw new PersonNotFoundException(id);
       }
        repositoryPort.deleteById(id);
        log.info("Person deleted successfully with ID: {}", id);
    }
}
