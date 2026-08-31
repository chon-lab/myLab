package com.mylab.backend.researchline.application.usecase;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.researchline.application.dto.UpdateResearchLineInput;
import com.mylab.backend.researchline.application.exception.ResearchLineNotFoundException;
import com.mylab.backend.researchline.application.port.in.UpdateResearchLinePort;
import com.mylab.backend.researchline.application.port.out.ResearchLineRepositoryPort;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UpdateResearchLineUsecase implements UpdateResearchLinePort {

    private final ResearchLineRepositoryPort repositoryPort;

    @Override
    @Transactional
    public void update(UUID id, UpdateResearchLineInput input) {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(input, "input must not be null");
        log.info("Updating research line with ID: {}", id);

        var researchLine = repositoryPort.findById(id)
        .orElseThrow(() ->
            new ResearchLineNotFoundException(id)
        );

        researchLine.updateDetails(
            input.name(),
            input.objective(),
            input.keywords(),
            input.knowledgeAreas(),
            input.applicationSectors(),
            LocalDateTime.now()
        );

        repositoryPort.save(researchLine);
        log.info("Research line updated successfully with ID: {}", id);
    }
}
