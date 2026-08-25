package com.mylab.backend.researchgroup.application.usecase;

import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.researchgroup.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.researchgroup.application.port.in.DeleteResearchGroupPort;
import com.mylab.backend.researchgroup.application.port.out.ResearchGroupRepositoryPort;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeleteResearchGroupUsecase implements DeleteResearchGroupPort {

    private final ResearchGroupRepositoryPort repositoryPort;

    @Override
    @Transactional
    public void delete(UUID id) {
        Objects.requireNonNull(id, "id must not be null");
        log.info("Deleting research group with ID: {}", id);

       if (repositoryPort.findById(id).isEmpty()) {
            throw new ResearchGroupNotFoundException(id);
       }
        repositoryPort.deleteById(id);
        log.info("Research group deleted successfully with ID: {}", id);
    }
}
