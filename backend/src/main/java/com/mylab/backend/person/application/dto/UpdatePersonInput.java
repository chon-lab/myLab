package com.mylab.backend.person.application.dto;

import java.util.List;
import java.util.UUID;

public record UpdatePersonInput(
        String name,
        String socialName,
        String email,
        String phone,
        String cpf,
        String academicDegree,
        List<String> areasOfExpertise,
        List<UUID> researchLineIds
) {}
