package com.mylab.backend.groupmember.infrastructure.adapters.out.persistence.mapper;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.mylab.backend.groupmember.domain.model.GroupMember;
import com.mylab.backend.groupmember.infrastructure.adapters.out.persistence.entity.GroupMemberEntity;

@Component
public class GroupMemberMapper {

    public GroupMember toDomain(GroupMemberEntity entity) {
        if (entity == null) {
            return null;
        }

        return GroupMember.builder()
                .id(entity.getId())
                .personId(entity.getPersonId())
                .researchGroupId(entity.getResearchGroupId())
                .status(entity.getStatus())
                .role(entity.getRole())
                .roleId(entity.getRoleId())
                .researchLineIds(entity.getResearchLineIds())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public GroupMemberEntity toEntity(GroupMember domain) {
        if (domain == null) {
            return null;
        }

        return GroupMemberEntity.builder()
                .id(domain.getId())
                .personId(domain.getPersonId())
                .researchGroupId(domain.getResearchGroupId())
                .status(domain.getStatus())
                .role(domain.getRole())
                .roleId(domain.getRoleId())
                .researchLineIds(new HashSet<>(domain.getResearchLineIds()))
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }

    public List<GroupMember> toDomainList(List<GroupMemberEntity> entities) {
        if (entities == null) {
            return List.of();
        }

        return entities.stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }
}
