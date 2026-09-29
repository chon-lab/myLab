package com.mylab.backend.groupmember.application.usecase;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.groupmember.application.exception.PersonNotFoundException;
import com.mylab.backend.groupmember.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.groupmember.application.port.in.GetAllGroupMembersPort;
import com.mylab.backend.groupmember.application.port.out.GroupMemberRepositoryPort;
import com.mylab.backend.groupmember.application.port.out.PersonLookupPort;
import com.mylab.backend.groupmember.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.groupmember.domain.model.GroupMember;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GetAllGroupMembersUsecase implements GetAllGroupMembersPort {

    private final GroupMemberRepositoryPort repositoryPort;
    private final ResearchGroupLookupPort researchGroupLookupPort;
    private final PersonLookupPort personLookupPort;

    @Override
    @Transactional(readOnly = true)
    public List<GroupMember> getAllByResearchGroup(UUID researchGroupId) {
        Objects.requireNonNull(researchGroupId, "researchGroupId must not be null");
        log.debug("Listing active group members for research group: {}", researchGroupId);

        if (!researchGroupLookupPort.existsById(researchGroupId)) {
            throw new ResearchGroupNotFoundException(researchGroupId);
        }

        return repositoryPort.findAllByResearchGroupIdAndActive(researchGroupId, true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GroupMember> getAllByPerson(UUID personId) {
        Objects.requireNonNull(personId, "personId must not be null");
        log.debug("Listing group memberships for person: {}", personId);

        if (!personLookupPort.existsById(personId)) {
            throw new PersonNotFoundException(personId);
        }

        return repositoryPort.findAllByPersonId(personId);
    }
}
