package com.mylab.backend.researchline.infrastructure.adapters.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.mylab.backend.researchline.application.port.out.ResearchLineRepositoryPort;
import com.mylab.backend.researchline.domain.model.ResearchLine;
import com.mylab.backend.researchline.infrastructure.adapters.out.persistence.entity.ResearchLineEntity;
import com.mylab.backend.researchline.infrastructure.adapters.out.persistence.mapper.ResearchLineMapper;
import com.mylab.backend.researchline.infrastructure.adapters.out.persistence.repository.ResearchLineJpaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ResearchLineJpaAdapter implements ResearchLineRepositoryPort {

    private final ResearchLineJpaRepository jpaRepository;
    private final ResearchLineMapper mapper;

    @Override
    public void save(ResearchLine researchLine) {
        log.debug("Saving research line with ID: {}", researchLine.getId());

        ResearchLineEntity entity = mapper.toEntity(researchLine);
        jpaRepository.save(entity);

        log.debug("Research line saved successfully with ID: {}", researchLine.getId());
    }

    @Override
    public Optional<ResearchLine> findById(UUID id) {
        log.debug("Finding research line by ID: {}", id);
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<ResearchLine> findAllByResearchGroupId(UUID researchGroupId) {
        log.debug("Finding research lines by research group ID: {}", researchGroupId);
        return mapper.toDomainList(jpaRepository.findAllByResearchGroupId(researchGroupId));
    }

    @Override
    public void deleteById(UUID id) {
        log.debug("Deleting research line by ID: {}", id);
        jpaRepository.deleteById(id);
        log.debug("Research line deleted successfully with ID: {}", id);
    }
}
