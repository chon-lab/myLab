package com.mylab.backend.laboratory.application.usecase;

import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.laboratory.application.exception.LaboratoryNotFoundException;
import com.mylab.backend.laboratory.application.port.in.GetLaboratoryPort;
import com.mylab.backend.laboratory.application.port.out.LaboratoryRepositoryPort;
import com.mylab.backend.laboratory.domain.model.Laboratory;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GetLaboratoryByIdUsecase implements GetLaboratoryPort {

    private final LaboratoryRepositoryPort repositoryPort;

    @Override
    @Transactional(readOnly = true)
    public Laboratory get(UUID id) {
        Objects.requireNonNull(id, "id must not be null");
        log.debug("Getting laboratory with ID: {}", id);
        return repositoryPort.findById(id)
                .orElseThrow(() -> new LaboratoryNotFoundException(id));
    }
}
