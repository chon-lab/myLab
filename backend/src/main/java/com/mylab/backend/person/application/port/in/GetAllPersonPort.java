package com.mylab.backend.person.application.port.in;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.person.domain.model.Person;

public interface GetAllPersonPort {
    List<Person> getAllByResearchGroup(UUID researchGroupId);
}
