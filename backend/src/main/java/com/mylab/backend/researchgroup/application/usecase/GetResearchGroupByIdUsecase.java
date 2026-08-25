package com.mylab.backend.researchgroup.application.usecase;

import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.researchgroup.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.researchgroup.application.port.in.GetResearchGroupPort;
import com.mylab.backend.researchgroup.application.port.out.ResearchGroupRepositoryPort;
import com.mylab.backend.researchgroup.domain.model.ResearchGroup;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GetResearchGroupByIdUsecase implements GetResearchGroupPort {

    private final ResearchGroupRepositoryPort repositoryPort;

    @Override
    @Transactional(readOnly = true)
    public ResearchGroup get(UUID id) {
        Objects.requireNonNull(id, "id must not be null");
        log.debug("Getting research group with ID: {}", id);
        return repositoryPort.findById(id)
        .orElseThrow(() ->
            new ResearchGroupNotFoundException(id)
        );
    }
    
}
