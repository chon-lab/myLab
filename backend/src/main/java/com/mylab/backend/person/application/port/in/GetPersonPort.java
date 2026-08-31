package com.mylab.backend.person.application.port.in;

import java.util.UUID;

import com.mylab.backend.person.domain.model.Person;

public interface GetPersonPort {
    Person get(UUID id);
}
