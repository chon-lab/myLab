package com.mylab.backend.laboratory.application.usecase;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.laboratory.application.exception.LaboratoryNotFoundException;
import com.mylab.backend.laboratory.application.port.in.DeleteLaboratoryPort;
import com.mylab.backend.laboratory.application.port.out.LaboratoryRepositoryPort;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeleteLaboratoryUsecase implements DeleteLaboratoryPort {

    private final LaboratoryRepositoryPort repositoryPort;

    @Override
    @Transactional
    public void delete(UUID id) {
        Objects.requireNonNull(id, "id must not be null");
        log.info("Archiving laboratory with ID: {}", id);

        var laboratory = repositoryPort.findById(id)
                .orElseThrow(() -> new LaboratoryNotFoundException(id));
        laboratory.archive(LocalDateTime.now());
        repositoryPort.save(laboratory);
    }
}
