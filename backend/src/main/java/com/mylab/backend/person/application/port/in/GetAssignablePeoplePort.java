package com.mylab.backend.person.application.port.in;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.person.application.dto.AssignablePersonView;

public interface GetAssignablePeoplePort {
    List<AssignablePersonView> getAssignable(UUID researchGroupId, String query);
}
