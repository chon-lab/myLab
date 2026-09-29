package com.mylab.backend.groupmember.infrastructure.adapters.out.persistence.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mylab.backend.groupmember.infrastructure.adapters.out.persistence.entity.GroupMemberEntity;

@Repository
public interface GroupMemberJpaRepository extends JpaRepository<GroupMemberEntity, UUID> {

    Optional<GroupMemberEntity> findByPersonIdAndResearchGroupId(UUID personId, UUID researchGroupId);

    List<GroupMemberEntity> findAllByResearchGroupIdAndActive(UUID researchGroupId, boolean active);

    List<GroupMemberEntity> findAllByPersonId(UUID personId);
}
