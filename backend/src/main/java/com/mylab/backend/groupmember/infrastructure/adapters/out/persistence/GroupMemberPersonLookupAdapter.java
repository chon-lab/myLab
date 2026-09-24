package com.mylab.backend.groupmember.infrastructure.adapters.out.persistence;

import java.util.UUID;

import org.springframework.stereotype.Component;

import com.mylab.backend.groupmember.application.port.out.PersonLookupPort;
import com.mylab.backend.person.infrastructure.adapters.out.persistence.repository.PersonJpaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class GroupMemberPersonLookupAdapter implements PersonLookupPort {

    private final PersonJpaRepository personJpaRepository;

    @Override
    public boolean existsById(UUID personId) {
        log.debug("Checking if person exists by ID: {}", personId);
        return personJpaRepository.existsById(personId);
    }
}
