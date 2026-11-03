package com.mylab.backend.groupmember.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.mylab.backend.groupmember.domain.model.GroupMember;
import com.mylab.backend.groupmember.domain.model.MembershipStatus;

public interface GroupMemberRepositoryPort {
    void save(GroupMember groupMember);
    Optional<GroupMember> findById(UUID id);
    Optional<GroupMember> findByPersonIdAndResearchGroupId(UUID personId, UUID researchGroupId);
    List<GroupMember> findAllByResearchGroupIdAndStatusNot(UUID researchGroupId, MembershipStatus status);
    List<GroupMember> findAllByPersonId(UUID personId);
    List<GroupMember> findAllByPersonIdAndStatus(UUID personId, MembershipStatus status);
    long countByRoleId(UUID roleId);
}
