package com.mylab.backend.groupmember.application.exception;

import java.util.UUID;

public class InvitationNotFoundException extends RuntimeException {

    public InvitationNotFoundException(UUID membershipId) {
        super("No pending invitation " + membershipId + " for the current user");
    }
}
