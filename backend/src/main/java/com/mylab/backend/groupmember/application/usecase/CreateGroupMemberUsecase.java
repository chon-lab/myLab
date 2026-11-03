package com.mylab.backend.groupmember.application.usecase;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.groupmember.application.dto.CreateGroupMemberInput;
import com.mylab.backend.groupmember.application.exception.GroupMemberAlreadyLinkedException;
import com.mylab.backend.groupmember.application.exception.PersonNotFoundException;
import com.mylab.backend.groupmember.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.groupmember.application.exception.ResearchLineNotFoundException;
import com.mylab.backend.groupmember.application.port.in.CreateGroupMemberPort;
import com.mylab.backend.groupmember.application.port.out.GroupMemberRepositoryPort;
import com.mylab.backend.groupmember.application.port.out.PersonLookupPort;
import com.mylab.backend.groupmember.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.groupmember.application.port.out.ResearchLineLookupPort;
import com.mylab.backend.groupmember.domain.model.GroupMember;
import com.mylab.backend.groupmember.domain.model.MembershipStatus;
import com.mylab.backend.role.application.exception.RoleNotFoundException;
import com.mylab.backend.role.application.port.out.RoleRepositoryPort;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreateGroupMemberUsecase implements CreateGroupMemberPort {

    private final GroupMemberRepositoryPort repositoryPort;
    private final ResearchGroupLookupPort researchGroupLookupPort;
    private final PersonLookupPort personLookupPort;
    private final ResearchLineLookupPort researchLineLookupPort;
    private final RoleRepositoryPort roleRepositoryPort;

    @Override
    @Transactional
    public UUID create(CreateGroupMemberInput input) {
        Objects.requireNonNull(input, "input must not be null");
        Objects.requireNonNull(input.researchGroupId(), "researchGroupId must not be null");
        Objects.requireNonNull(input.personId(), "personId must not be null");
        Objects.requireNonNull(input.roleId(), "roleId must not be null");

        log.info(
                "Inviting person {} to research group {}",
                input.personId(),
                input.researchGroupId()
        );

        if (!researchGroupLookupPort.existsById(input.researchGroupId())) {
            throw new ResearchGroupNotFoundException(input.researchGroupId());
        }

        if (!personLookupPort.existsById(input.personId())) {
            throw new PersonNotFoundException(input.personId());
        }

        validateRoleBelongsToGroup(input.roleId(), input.researchGroupId());

        LocalDateTime now = LocalDateTime.now();
        Set<UUID> researchLineIds = validateResearchLineIds(input.researchLineIds(), input.researchGroupId());

        var existing = repositoryPort.findByPersonIdAndResearchGroupId(
                input.personId(),
                input.researchGroupId()
        );

        if (existing.isPresent()) {
            GroupMember member = existing.get();
            if (member.getStatus() != MembershipStatus.INACTIVE) {
                throw new GroupMemberAlreadyLinkedException(
                        input.personId(),
                        input.researchGroupId(),
                        member.isPending()
                );
            }
            member.invite(input.roleId(), researchLineIds, now);
            repositoryPort.save(member);
            log.info("Group member re-invited with ID: {}", member.getId());
            return member.getId();
        }

        GroupMember member = GroupMember.builder()
                .id(UUID.randomUUID())
                .personId(input.personId())
                .researchGroupId(input.researchGroupId())
                .status(MembershipStatus.PENDING)
                .roleId(input.roleId())
                .researchLineIds(researchLineIds)
                .createdAt(now)
                .updatedAt(now)
                .build();

        repositoryPort.save(member);
        log.info("Group member invitation created with ID: {}", member.getId());
        return member.getId();
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

    private void validateRoleBelongsToGroup(UUID roleId, UUID researchGroupId) {
        roleRepositoryPort.findById(roleId)
                .filter(role -> role.getResearchGroupId().equals(researchGroupId))
                .orElseThrow(() -> new RoleNotFoundException(roleId));
    }
}
