package com.mylab.backend.project.infrastructure.adapters.out.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.mylab.backend.laboratory.infrastructure.adapters.out.persistence.entity.LaboratoryEntity;
import com.mylab.backend.laboratory.infrastructure.adapters.out.persistence.repository.LaboratoryJpaRepository;
import com.mylab.backend.project.application.port.out.LaboratoryLookupPort;

import lombok.RequiredArgsConstructor;

@Component("projectLaboratoryLookupAdapter")
@RequiredArgsConstructor
public class LaboratoryLookupAdapter implements LaboratoryLookupPort {

    private final LaboratoryJpaRepository laboratoryJpaRepository;

    @Override
    public Optional<UUID> findResearchGroupIdById(UUID laboratoryId) {
        return laboratoryJpaRepository.findByIdAndDeletedAtIsNull(laboratoryId)
                .map(LaboratoryEntity::getResearchGroupId);
    }
}
