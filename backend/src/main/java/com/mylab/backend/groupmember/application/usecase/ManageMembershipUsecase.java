package com.mylab.backend.groupmember.application.usecase;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.groupmember.application.dto.InvitationView;
import com.mylab.backend.groupmember.application.exception.GroupMemberNotFoundException;
import com.mylab.backend.groupmember.application.exception.InvitationNotFoundException;
import com.mylab.backend.groupmember.application.port.in.ManageMembershipPort;
import com.mylab.backend.groupmember.application.port.out.GroupMemberRepositoryPort;
import com.mylab.backend.groupmember.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.groupmember.domain.model.GroupMember;
import com.mylab.backend.groupmember.domain.model.MembershipStatus;
import com.mylab.backend.role.application.port.out.RoleRepositoryPort;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ManageMembershipUsecase implements ManageMembershipPort {

    private final GroupMemberRepositoryPort repositoryPort;
    private final ResearchGroupLookupPort researchGroupLookupPort;
    private final RoleRepositoryPort roleRepositoryPort;

    @Override
    @Transactional(readOnly = true)
    public List<InvitationView> getPendingInvitations(UUID personId) {
        Objects.requireNonNull(personId, "personId must not be null");
        log.debug("Listing pending invitations for person: {}", personId);

        return repositoryPort.findAllByPersonIdAndStatus(personId, MembershipStatus.PENDING).stream()
                .map(this::toView)
                .toList();
    }

    @Override
    @Transactional
    public void acceptInvitation(UUID personId, UUID membershipId) {
        GroupMember invitation = requireOwnInvitation(personId, membershipId);
        invitation.accept(LocalDateTime.now());
        repositoryPort.save(invitation);
        log.info("Invitation {} accepted by person {}", membershipId, personId);
    }

    @Override
    @Transactional
    public void rejectInvitation(UUID personId, UUID membershipId) {
        GroupMember invitation = requireOwnInvitation(personId, membershipId);
        invitation.reject(LocalDateTime.now());
        repositoryPort.save(invitation);
        log.info("Invitation {} rejected by person {}", membershipId, personId);
    }

    @Override
    @Transactional
    public void leaveResearchGroup(UUID personId, UUID researchGroupId) {
        Objects.requireNonNull(personId, "personId must not be null");
        Objects.requireNonNull(researchGroupId, "researchGroupId must not be null");

        GroupMember member = repositoryPort.findByPersonIdAndResearchGroupId(personId, researchGroupId)
                .orElseThrow(() -> new GroupMemberNotFoundException(personId, researchGroupId));

        member.leave(LocalDateTime.now());
        repositoryPort.save(member);
        log.info("Person {} left research group {}", personId, researchGroupId);
    }

    private GroupMember requireOwnInvitation(UUID personId, UUID membershipId) {
        Objects.requireNonNull(personId, "personId must not be null");
        Objects.requireNonNull(membershipId, "membershipId must not be null");

        return repositoryPort.findById(membershipId)
                .filter(member -> member.getPersonId().equals(personId))
                .filter(GroupMember::isPending)
                .orElseThrow(() -> new InvitationNotFoundException(membershipId));
    }

    private InvitationView toView(GroupMember member) {
        String groupName = researchGroupLookupPort.findName(member.getResearchGroupId()).orElse(null);
        String roleName = member.getRoleId() == null
                ? null
                : roleRepositoryPort.findById(member.getRoleId()).map(role -> role.getName()).orElse(null);

        return new InvitationView(
                member.getId(),
                member.getResearchGroupId(),
                groupName,
                member.getRoleId(),
                roleName
        );
    }
}
