package com.mylab.backend.laboratory.application.usecase;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.laboratory.application.exception.LaboratoryNotFoundException;
import com.mylab.backend.laboratory.application.exception.LaboratoryHasStockException;
import com.mylab.backend.laboratory.application.port.in.DeleteLaboratoryPort;
import com.mylab.backend.laboratory.application.port.out.LaboratoryRepositoryPort;
import com.mylab.backend.laboratory.application.port.out.LaboratoryStockLookupPort;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeleteLaboratoryUsecase implements DeleteLaboratoryPort {

    private final LaboratoryRepositoryPort repositoryPort;
    private final LaboratoryStockLookupPort stockLookupPort;

    @Override
    @Transactional
    public void delete(UUID id) {
        Objects.requireNonNull(id, "id must not be null");
        log.info("Archiving laboratory with ID: {}", id);

        var laboratory = repositoryPort.findByIdForUpdate(id)
                .orElseThrow(() -> new LaboratoryNotFoundException(id));
        if (stockLookupPort.hasStock(laboratory.getResearchGroupId(), id)) {
            throw new LaboratoryHasStockException(id);
        }
        laboratory.archive(LocalDateTime.now());
        repositoryPort.save(laboratory);
    }
}
