package com.mylab.backend.researchgroup.infrastructure.adapters.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.mylab.backend.researchgroup.application.port.out.ResearchGroupRepositoryPort;
import com.mylab.backend.researchgroup.domain.model.ResearchGroup;
import com.mylab.backend.researchgroup.infrastructure.adapters.out.persistence.entity.ResearchGroupEntity;
import com.mylab.backend.researchgroup.infrastructure.adapters.out.persistence.mapper.ResearchGroupMapper;
import com.mylab.backend.researchgroup.infrastructure.adapters.out.persistence.repository.ResearchGroupJpaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ResearchGroupJpaAdapter implements ResearchGroupRepositoryPort {

    private final ResearchGroupJpaRepository jpaRepository;
    private final ResearchGroupMapper mapper;

    @Override
    public void save(ResearchGroup researchGroup) {
        log.debug("Saving research group with ID: {}", researchGroup.getId());

        ResearchGroupEntity entity = mapper.toEntity(researchGroup);
        jpaRepository.save(entity);

        log.debug("Research group saved successfully with ID: {}", researchGroup.getId());
    }

    @Override
    public Optional<ResearchGroup> findById(UUID id) {
        log.debug("Finding research group by ID: {}", id);
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public boolean existsByCnpqId(String cnpqId) {
        log.debug("Checking if research group exists by CNPq ID: {}", cnpqId);
        return jpaRepository.existsByCnpqId(cnpqId);
    }

    @Override
    public List<ResearchGroup> findAll() {
        log.debug("Finding all research groups");
        return mapper.toDomainList(jpaRepository.findAll());
    }

    @Override
    public void deleteById(UUID id) {
        log.debug("Deleting research group by ID: {}", id);
        jpaRepository.deleteById(id);
        log.debug("Research group deleted successfully with ID: {}", id);
    }
}
