package com.mylab.backend.groupmember.application.exception;

import java.util.UUID;

public class GroupMemberAlreadyActiveException extends RuntimeException {

    public GroupMemberAlreadyActiveException(UUID personId, UUID researchGroupId) {
        super("Person " + personId + " is already an active member of research group " + researchGroupId);
    }
}
