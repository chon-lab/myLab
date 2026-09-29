package com.mylab.backend.groupmember.infrastructure.adapters.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.mylab.backend.groupmember.application.port.out.GroupMemberRepositoryPort;
import com.mylab.backend.groupmember.domain.model.GroupMember;
import com.mylab.backend.groupmember.infrastructure.adapters.out.persistence.entity.GroupMemberEntity;
import com.mylab.backend.groupmember.infrastructure.adapters.out.persistence.mapper.GroupMemberMapper;
import com.mylab.backend.groupmember.infrastructure.adapters.out.persistence.repository.GroupMemberJpaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class GroupMemberJpaAdapter implements GroupMemberRepositoryPort {

    private final GroupMemberJpaRepository jpaRepository;
    private final GroupMemberMapper mapper;

    @Override
    public void save(GroupMember groupMember) {
        log.debug("Saving group member with ID: {}", groupMember.getId());
        GroupMemberEntity entity = mapper.toEntity(groupMember);
        jpaRepository.save(entity);
        log.debug("Group member saved successfully with ID: {}", groupMember.getId());
    }

    @Override
    public Optional<GroupMember> findById(UUID id) {
        log.debug("Finding group member by ID: {}", id);
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<GroupMember> findByPersonIdAndResearchGroupId(UUID personId, UUID researchGroupId) {
        log.debug("Finding group member by person {} and research group {}", personId, researchGroupId);
        return jpaRepository.findByPersonIdAndResearchGroupId(personId, researchGroupId)
                .map(mapper::toDomain);
    }

    @Override
    public List<GroupMember> findAllByResearchGroupIdAndActive(UUID researchGroupId, boolean active) {
        log.debug("Finding group members by research group {} active={}", researchGroupId, active);
        return mapper.toDomainList(jpaRepository.findAllByResearchGroupIdAndActive(researchGroupId, active));
    }

    @Override
    public List<GroupMember> findAllByPersonId(UUID personId) {
        log.debug("Finding group members by person ID: {}", personId);
        return mapper.toDomainList(jpaRepository.findAllByPersonId(personId));
    }
}
