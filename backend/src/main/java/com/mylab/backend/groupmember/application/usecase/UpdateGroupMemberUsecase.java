package com.mylab.backend.groupmember.application.usecase;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.groupmember.application.dto.UpdateGroupMemberInput;
import com.mylab.backend.groupmember.application.exception.GroupMemberNotFoundException;
import com.mylab.backend.groupmember.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.groupmember.application.exception.ResearchLineNotFoundException;
import com.mylab.backend.groupmember.application.port.in.UpdateGroupMemberPort;
import com.mylab.backend.groupmember.application.port.out.GroupMemberRepositoryPort;
import com.mylab.backend.groupmember.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.groupmember.application.port.out.ResearchLineLookupPort;
import com.mylab.backend.groupmember.domain.model.GroupMember;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UpdateGroupMemberUsecase implements UpdateGroupMemberPort {

    private final GroupMemberRepositoryPort repositoryPort;
    private final ResearchGroupLookupPort researchGroupLookupPort;
    private final ResearchLineLookupPort researchLineLookupPort;

    @Override
    @Transactional
    public void update(UUID researchGroupId, UUID personId, UpdateGroupMemberInput input) {
        Objects.requireNonNull(researchGroupId, "researchGroupId must not be null");
        Objects.requireNonNull(personId, "personId must not be null");
        Objects.requireNonNull(input, "input must not be null");

        log.info("Updating group member for person {} in research group {}", personId, researchGroupId);

        if (!researchGroupLookupPort.existsById(researchGroupId)) {
            throw new ResearchGroupNotFoundException(researchGroupId);
        }

        GroupMember member = repositoryPort.findByPersonIdAndResearchGroupId(personId, researchGroupId)
                .orElseThrow(() -> new GroupMemberNotFoundException(personId, researchGroupId));

        LocalDateTime now = LocalDateTime.now();
        boolean active = input.active() != null ? input.active() : member.isActive();
        Set<UUID> researchLineIds = input.researchLineIds() != null
                ? validateResearchLineIds(input.researchLineIds(), researchGroupId)
                : member.getResearchLineIds();

        member.update(active, researchLineIds, now);
        repositoryPort.save(member);
        log.info("Group member updated successfully with ID: {}", member.getId());
    }

    private Set<UUID> validateResearchLineIds(List<UUID> researchLineIds, UUID researchGroupId) {
        if (researchLineIds == null || researchLineIds.isEmpty()) {
            return Set.of();
        }

        Set<UUID> validated = new HashSet<>();
        for (UUID researchLineId : researchLineIds) {
            if (!researchLineLookupPort.existsByIdAndResearchGroupId(researchLineId, researchGroupId)) {
                throw new ResearchLineNotFoundException(researchLineId);
            }
            validated.add(researchLineId);
        }
        return Set.copyOf(validated);
    }
}
