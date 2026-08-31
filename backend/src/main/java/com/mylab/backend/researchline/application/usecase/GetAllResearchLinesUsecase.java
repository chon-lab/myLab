package com.mylab.backend.researchline.application.usecase;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.researchline.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.researchline.application.port.in.GetAllResearchLinePort;
import com.mylab.backend.researchline.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.researchline.application.port.out.ResearchLineRepositoryPort;
import com.mylab.backend.researchline.domain.model.ResearchLine;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GetAllResearchLinesUsecase implements GetAllResearchLinePort {

    private final ResearchLineRepositoryPort repositoryPort;
    private final ResearchGroupLookupPort researchGroupLookupPort;

    @Override
    @Transactional(readOnly = true)
    public List<ResearchLine> getAllByResearchGroup(UUID researchGroupId) {
        Objects.requireNonNull(researchGroupId, "researchGroupId must not be null");
        log.debug("Listing research lines for research group: {}", researchGroupId);

        if (!researchGroupLookupPort.existsById(researchGroupId)) {
            throw new ResearchGroupNotFoundException(researchGroupId);
        }

        return repositoryPort.findAllByResearchGroupId(researchGroupId);
    }
}
