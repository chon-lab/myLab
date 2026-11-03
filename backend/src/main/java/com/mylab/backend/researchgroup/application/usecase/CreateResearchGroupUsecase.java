package com.mylab.backend.researchgroup.application.usecase;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.groupmember.application.port.out.GroupMemberRepositoryPort;
import com.mylab.backend.groupmember.domain.model.GroupMember;
import com.mylab.backend.groupmember.domain.model.GroupMemberRole;
import com.mylab.backend.groupmember.domain.model.MembershipStatus;
import com.mylab.backend.researchgroup.application.dto.CreateResearchGroupInput;
import com.mylab.backend.researchgroup.application.port.in.CreateResearchGroupPort;
import com.mylab.backend.researchgroup.application.port.out.ResearchGroupRepositoryPort;
import com.mylab.backend.researchgroup.domain.exception.DuplicateCnpqIdException;
import com.mylab.backend.researchgroup.domain.model.ResearchGroup;
import com.mylab.backend.role.application.port.out.RoleRepositoryPort;
import com.mylab.backend.role.domain.model.Role;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreateResearchGroupUsecase implements CreateResearchGroupPort {

    private final ResearchGroupRepositoryPort repositoryPort;
    private final RoleRepositoryPort roleRepositoryPort;
    private final GroupMemberRepositoryPort groupMemberRepositoryPort;

    @Override
    @Transactional
    public UUID create(CreateResearchGroupInput input, UUID creatorPersonId) {
        log.info("Creating research group with CNPq ID: {}", input.cnpqId());

        if (repositoryPort.existsByCnpqId(input.cnpqId())) {
            throw new DuplicateCnpqIdException(input.cnpqId());
        }

        LocalDateTime now = LocalDateTime.now();
        ResearchGroup researchGroup = ResearchGroup.builder()
                .id(UUID.randomUUID())
                .cnpqId(input.cnpqId())
                .name(input.name())
                .situation(input.situation())
                .formationYear(input.formationYear())
                .situationAt(input.situationAt())
                .lastSubmittedAt(input.lastSubmittedAt())
                .predominantArea(input.predominantArea())
                .institutionName(input.institutionName())
                .institutionUnit(input.institutionUnit())
                .sourceUrl(input.sourceUrl())
                .repercussions(input.repercussions())
                .address(input.address())
                .contacts(input.contacts())
                .createdAt(now)
                .updatedAt(now)
                .build();

        repositoryPort.save(researchGroup);

        Role adminRole = Role.admin(researchGroup.getId(), now);
        roleRepositoryPort.save(adminRole);

        GroupMember creator = GroupMember.builder()
                .id(UUID.randomUUID())
                .personId(creatorPersonId)
                .researchGroupId(researchGroup.getId())
                .status(MembershipStatus.ACTIVE)
                .role(GroupMemberRole.ADMIN)
                .roleId(adminRole.getId())
                .researchLineIds(Set.of())
                .createdAt(now)
                .updatedAt(now)
                .build();
        groupMemberRepositoryPort.save(creator);

        log.info("Research group created successfully with ID: {} and admin {}",
                researchGroup.getId(), creatorPersonId);
        return researchGroup.getId();
    }
}
