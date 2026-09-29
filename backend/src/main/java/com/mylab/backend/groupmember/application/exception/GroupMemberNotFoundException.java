package com.mylab.backend.groupmember.application.exception;

import java.util.UUID;

public class GroupMemberNotFoundException extends RuntimeException {

    public GroupMemberNotFoundException(UUID id) {
        super("Group member " + id + " was not found");
    }

    public GroupMemberNotFoundException(UUID personId, UUID researchGroupId) {
        super("Group member for person " + personId + " in research group " + researchGroupId + " was not found");
    }
}
