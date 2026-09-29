package com.mylab.backend.person.application.usecase;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.groupmember.application.port.in.GetAllGroupMembersPort;
import com.mylab.backend.groupmember.domain.model.GroupMember;
import com.mylab.backend.person.application.port.in.GetAllPersonPort;
import com.mylab.backend.person.application.port.out.PersonRepositoryPort;
import com.mylab.backend.person.domain.model.Person;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GetAllPersonsUsecase implements GetAllPersonPort {

    private final PersonRepositoryPort repositoryPort;
    private final GetAllGroupMembersPort getAllGroupMembersPort;

    @Override
    @Transactional(readOnly = true)
    public List<Person> getAllByResearchGroup(UUID researchGroupId) {
        Objects.requireNonNull(researchGroupId, "researchGroupId must not be null");
        log.debug("Listing people for research group: {}", researchGroupId);

        List<UUID> personIds = getAllGroupMembersPort.getAllByResearchGroup(researchGroupId).stream()
                .map(GroupMember::getPersonId)
                .toList();

        return repositoryPort.findAllByIds(personIds);
    }
}
