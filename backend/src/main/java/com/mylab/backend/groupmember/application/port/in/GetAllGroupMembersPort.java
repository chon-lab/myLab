package com.mylab.backend.groupmember.application.port.in;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.groupmember.domain.model.GroupMember;

public interface GetAllGroupMembersPort {
    List<GroupMember> getAllByResearchGroup(UUID researchGroupId);
    List<GroupMember> getAllByPerson(UUID personId);
}
