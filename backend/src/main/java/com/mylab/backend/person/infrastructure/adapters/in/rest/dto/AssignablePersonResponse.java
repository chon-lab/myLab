package com.mylab.backend.person.infrastructure.adapters.in.rest.dto;

import java.util.UUID;

public record AssignablePersonResponse(
        UUID id,
        String name,
        String email,
        String academicDegree
) {}
