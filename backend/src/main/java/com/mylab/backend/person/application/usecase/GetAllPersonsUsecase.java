package com.mylab.backend.person.application.usecase;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.person.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.person.application.port.in.GetAllPersonPort;
import com.mylab.backend.person.application.port.out.PersonRepositoryPort;
import com.mylab.backend.person.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.person.domain.model.Person;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GetAllPersonsUsecase implements GetAllPersonPort {

    private final PersonRepositoryPort repositoryPort;
    private final ResearchGroupLookupPort researchGroupLookupPort;

    @Override
    @Transactional(readOnly = true)
    public List<Person> getAllByResearchGroup(UUID researchGroupId) {
        Objects.requireNonNull(researchGroupId, "researchGroupId must not be null");
        log.debug("Listing people for research group: {}", researchGroupId);

        if (!researchGroupLookupPort.existsById(researchGroupId)) {
            throw new ResearchGroupNotFoundException(researchGroupId);
        }

        return repositoryPort.findAllByResearchGroupId(researchGroupId);
    }
}
