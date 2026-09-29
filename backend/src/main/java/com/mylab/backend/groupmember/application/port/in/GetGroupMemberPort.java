package com.mylab.backend.groupmember.application.port.in;

import java.util.UUID;

import com.mylab.backend.groupmember.domain.model.GroupMember;

public interface GetGroupMemberPort {
    GroupMember get(UUID id);
}
