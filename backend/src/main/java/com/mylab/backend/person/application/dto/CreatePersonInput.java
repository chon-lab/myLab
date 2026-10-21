package com.mylab.backend.person.application.dto;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.groupmember.domain.model.GroupMemberRole;

public record CreatePersonInput(
        UUID researchGroupId,
        String name,
        String socialName,
        String email,
        String phone,
        String cpf,
        String academicDegree,
        List<String> areasOfExpertise,
        GroupMemberRole role,
        List<UUID> researchLineIds
) {}
