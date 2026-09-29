package com.mylab.backend.groupmember.application.port.in;

import java.util.UUID;

import com.mylab.backend.groupmember.application.dto.CreateGroupMemberInput;

public interface CreateGroupMemberPort {
    UUID create(CreateGroupMemberInput input);
}
