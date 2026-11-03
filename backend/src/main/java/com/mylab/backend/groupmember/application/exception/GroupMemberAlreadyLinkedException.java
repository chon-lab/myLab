package com.mylab.backend.groupmember.application.exception;

import java.util.UUID;

public class GroupMemberAlreadyLinkedException extends RuntimeException {

    public GroupMemberAlreadyLinkedException(UUID personId, UUID researchGroupId, boolean pending) {
        super(pending
                ? "Person " + personId + " already has a pending invitation to research group " + researchGroupId
                : "Person " + personId + " is already an active member of research group " + researchGroupId);
    }
}
