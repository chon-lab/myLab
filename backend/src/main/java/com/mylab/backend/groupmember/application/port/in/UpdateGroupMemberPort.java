package com.mylab.backend.groupmember.application.port.in;

import java.util.UUID;

import com.mylab.backend.groupmember.application.dto.UpdateGroupMemberInput;

public interface UpdateGroupMemberPort {
    void update(UUID researchGroupId, UUID personId, UpdateGroupMemberInput input);
}
