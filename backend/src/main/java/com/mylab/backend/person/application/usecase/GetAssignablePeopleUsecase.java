package com.mylab.backend.person.application.usecase;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.groupmember.application.port.in.GetAllGroupMembersPort;
import com.mylab.backend.groupmember.domain.model.GroupMember;
import com.mylab.backend.person.application.dto.AssignablePersonView;
import com.mylab.backend.person.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.person.application.port.in.GetAssignablePeoplePort;
import com.mylab.backend.person.application.port.out.PersonRepositoryPort;
import com.mylab.backend.person.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.person.domain.model.Person;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GetAssignablePeopleUsecase implements GetAssignablePeoplePort {

    private static final int RESULT_LIMIT = 20;
    private static final int CANDIDATE_LIMIT = 60;

    private final PersonRepositoryPort repositoryPort;
    private final ResearchGroupLookupPort researchGroupLookupPort;
    private final GetAllGroupMembersPort getAllGroupMembersPort;

    @Override
    @Transactional(readOnly = true)
    public List<AssignablePersonView> getAssignable(UUID researchGroupId, String query) {
        Objects.requireNonNull(researchGroupId, "researchGroupId must not be null");
        log.debug("Listing assignable people for research group: {}", researchGroupId);

        if (!researchGroupLookupPort.existsById(researchGroupId)) {
            throw new ResearchGroupNotFoundException(researchGroupId);
        }

        Set<UUID> alreadyLinked = getAllGroupMembersPort.getAllByResearchGroup(researchGroupId).stream()
                .map(GroupMember::getPersonId)
                .collect(Collectors.toSet());

        return repositoryPort.searchAssignable(query, CANDIDATE_LIMIT).stream()
                .filter(person -> !alreadyLinked.contains(person.getId()))
                .limit(RESULT_LIMIT)
                .map(this::toView)
                .toList();
    }

    private AssignablePersonView toView(Person person) {
        return new AssignablePersonView(
                person.getId(),
                person.getName(),
                person.getEmail(),
                person.getAcademicDegree()
        );
    }
}
