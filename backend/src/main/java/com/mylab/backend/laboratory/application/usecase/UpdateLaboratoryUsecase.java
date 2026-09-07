package com.mylab.backend.laboratory.application.usecase;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.laboratory.application.dto.UpdateLaboratoryInput;
import com.mylab.backend.laboratory.application.exception.LaboratoryNotFoundException;
import com.mylab.backend.laboratory.application.port.in.UpdateLaboratoryPort;
import com.mylab.backend.laboratory.application.port.out.LaboratoryRepositoryPort;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UpdateLaboratoryUsecase implements UpdateLaboratoryPort {

    private final LaboratoryRepositoryPort repositoryPort;

    @Override
    @Transactional
    public void update(UUID id, UpdateLaboratoryInput input) {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(input, "input must not be null");
        log.info("Updating laboratory with ID: {}", id);

        var laboratory = repositoryPort.findById(id)
                .orElseThrow(() -> new LaboratoryNotFoundException(id));
        laboratory.updateDetails(input.name(), input.address(), LocalDateTime.now());
        repositoryPort.save(laboratory);
    }
}
