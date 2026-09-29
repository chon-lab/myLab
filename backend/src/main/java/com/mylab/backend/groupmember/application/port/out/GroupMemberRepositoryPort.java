package com.mylab.backend.groupmember.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.mylab.backend.groupmember.domain.model.GroupMember;

public interface GroupMemberRepositoryPort {
    void save(GroupMember groupMember);
    Optional<GroupMember> findById(UUID id);
    Optional<GroupMember> findByPersonIdAndResearchGroupId(UUID personId, UUID researchGroupId);
    List<GroupMember> findAllByResearchGroupIdAndActive(UUID researchGroupId, boolean active);
    List<GroupMember> findAllByPersonId(UUID personId);
}
