package com.mylab.backend.person.application.dto;

import java.util.UUID;

public record AssignablePersonView(
        UUID id,
        String name,
        String email,
        String academicDegree
) {}
