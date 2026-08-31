package com.mylab.backend.person.infrastructure.adapters.out.persistence.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mylab.backend.person.infrastructure.adapters.out.persistence.entity.PersonEntity;

@Repository
public interface PersonJpaRepository extends JpaRepository<PersonEntity, UUID> {

    List<PersonEntity> findAllByResearchGroupId(UUID researchGroupId);
}
