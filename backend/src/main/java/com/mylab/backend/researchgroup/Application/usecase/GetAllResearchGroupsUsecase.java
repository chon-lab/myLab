package com.mylab.backend.researchgroup.application.usecase;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.researchgroup.application.port.in.GetAllResearchGroupPort;
import com.mylab.backend.researchgroup.application.port.out.ResearchGroupRepositoryPort;
import com.mylab.backend.researchgroup.domain.model.ResearchGroup;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GetAllResearchGroupsUsecase implements GetAllResearchGroupPort {

    private final ResearchGroupRepositoryPort repositoryPort;

    @Override
    @Transactional(readOnly = true)
    public List<ResearchGroup> getAll() {
        log.debug("Listing all research groups");
        return repositoryPort.findAll();
    }
}
