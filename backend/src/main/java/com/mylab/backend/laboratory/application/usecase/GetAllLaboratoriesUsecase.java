package com.mylab.backend.laboratory.application.usecase;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.laboratory.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.laboratory.application.port.in.GetAllLaboratoriesPort;
import com.mylab.backend.laboratory.application.port.out.LaboratoryRepositoryPort;
import com.mylab.backend.laboratory.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.laboratory.domain.model.Laboratory;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GetAllLaboratoriesUsecase implements GetAllLaboratoriesPort {

    private final LaboratoryRepositoryPort repositoryPort;
    private final ResearchGroupLookupPort researchGroupLookupPort;

    @Override
    @Transactional(readOnly = true)
    public List<Laboratory> getAllByResearchGroup(UUID researchGroupId) {
        Objects.requireNonNull(researchGroupId, "researchGroupId must not be null");
        log.debug("Listing laboratories for research group: {}", researchGroupId);

        if (!researchGroupLookupPort.existsById(researchGroupId)) {
            throw new ResearchGroupNotFoundException(researchGroupId);
        }
        return repositoryPort.findAllByResearchGroupId(researchGroupId);
    }
}
