package com.mylab.backend.researchgroup.infrastructure.adapters.out.persistence.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mylab.backend.researchgroup.infrastructure.adapters.out.persistence.entity.ResearchGroupEntity;

@Repository
public interface ResearchGroupJpaRepository extends JpaRepository<ResearchGroupEntity, UUID> {

    boolean existsByCnpqId(String cnpqId);
}
