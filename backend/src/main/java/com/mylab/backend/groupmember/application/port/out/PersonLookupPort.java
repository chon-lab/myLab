package com.mylab.backend.groupmember.application.port.out;

import java.util.UUID;

public interface PersonLookupPort {
    boolean existsById(UUID personId);
}
