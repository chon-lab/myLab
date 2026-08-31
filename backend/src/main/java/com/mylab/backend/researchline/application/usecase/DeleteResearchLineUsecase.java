package com.mylab.backend.researchline.application.usecase;

import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.researchline.application.exception.ResearchLineNotFoundException;
import com.mylab.backend.researchline.application.port.in.DeleteResearchLinePort;
import com.mylab.backend.researchline.application.port.out.ResearchLineRepositoryPort;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeleteResearchLineUsecase implements DeleteResearchLinePort {

    private final ResearchLineRepositoryPort repositoryPort;

    @Override
    @Transactional
    public void delete(UUID id) {
        Objects.requireNonNull(id, "id must not be null");
        log.info("Deleting research line with ID: {}", id);

       if (repositoryPort.findById(id).isEmpty()) {
            throw new ResearchLineNotFoundException(id);
       }
        repositoryPort.deleteById(id);
        log.info("Research line deleted successfully with ID: {}", id);
    }
}
