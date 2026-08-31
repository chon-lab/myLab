package com.mylab.backend.person.infrastructure.adapters.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.mylab.backend.person.application.port.out.PersonRepositoryPort;
import com.mylab.backend.person.domain.model.Person;
import com.mylab.backend.person.infrastructure.adapters.out.persistence.entity.PersonEntity;
import com.mylab.backend.person.infrastructure.adapters.out.persistence.mapper.PersonMapper;
import com.mylab.backend.person.infrastructure.adapters.out.persistence.repository.PersonJpaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class PersonJpaAdapter implements PersonRepositoryPort {

    private final PersonJpaRepository jpaRepository;
    private final PersonMapper mapper;

    @Override
    public void save(Person person) {
        log.debug("Saving person with ID: {}", person.getId());

        PersonEntity entity = mapper.toEntity(person);
        jpaRepository.save(entity);

        log.debug("Person saved successfully with ID: {}", person.getId());
    }

    @Override
    public Optional<Person> findById(UUID id) {
        log.debug("Finding person by ID: {}", id);
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Person> findAllByResearchGroupId(UUID researchGroupId) {
        log.debug("Finding people by research group ID: {}", researchGroupId);
        return mapper.toDomainList(jpaRepository.findAllByResearchGroupId(researchGroupId));
    }

    @Override
    public void deleteById(UUID id) {
        log.debug("Deleting person by ID: {}", id);
        jpaRepository.deleteById(id);
        log.debug("Person deleted successfully with ID: {}", id);
    }
}
