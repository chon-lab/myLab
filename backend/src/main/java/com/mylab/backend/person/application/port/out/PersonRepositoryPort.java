package com.mylab.backend.person.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.mylab.backend.person.domain.model.Person;

public interface PersonRepositoryPort {
    void save(Person person);
    Optional<Person> findById(UUID id);
    List<Person> findAllByResearchGroupId(UUID researchGroupId);
    void deleteById(UUID id);
}
