package com.mylab.backend.researchline.application.usecase;

import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.researchline.application.exception.ResearchLineNotFoundException;
import com.mylab.backend.researchline.application.port.in.GetResearchLinePort;
import com.mylab.backend.researchline.application.port.out.ResearchLineRepositoryPort;
import com.mylab.backend.researchline.domain.model.ResearchLine;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GetResearchLineByIdUsecase implements GetResearchLinePort {

    private final ResearchLineRepositoryPort repositoryPort;

    @Override
    @Transactional(readOnly = true)
    public ResearchLine get(UUID id) {
        Objects.requireNonNull(id, "id must not be null");
        log.debug("Getting research line with ID: {}", id);
        return repositoryPort.findById(id)
        .orElseThrow(() ->
            new ResearchLineNotFoundException(id)
        );
    }

}
