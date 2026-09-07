package com.mylab.backend.laboratory.infrastructure.adapters.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.mylab.backend.laboratory.application.port.out.LaboratoryRepositoryPort;
import com.mylab.backend.laboratory.domain.model.Laboratory;
import com.mylab.backend.laboratory.infrastructure.adapters.out.persistence.mapper.LaboratoryMapper;
import com.mylab.backend.laboratory.infrastructure.adapters.out.persistence.repository.LaboratoryJpaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class LaboratoryJpaAdapter implements LaboratoryRepositoryPort {

    private final LaboratoryJpaRepository jpaRepository;
    private final LaboratoryMapper mapper;

    @Override
    public void save(Laboratory laboratory) {
        log.debug("Saving laboratory with ID: {}", laboratory.getId());
        jpaRepository.save(mapper.toEntity(laboratory));
    }

    @Override
    public Optional<Laboratory> findById(UUID id) {
        return jpaRepository.findByIdAndDeletedAtIsNull(id).map(mapper::toDomain);
    }

    @Override
    public List<Laboratory> findAllByResearchGroupId(UUID researchGroupId) {
        return mapper.toDomainList(jpaRepository.findAllByResearchGroupIdAndDeletedAtIsNull(researchGroupId));
    }
}
