package com.mylab.backend.inventory.application.usecase;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.ReverseInventoryExitInput;
import com.mylab.backend.inventory.application.exception.InventoryExitNotFoundException;
import com.mylab.backend.inventory.application.port.in.ReverseInventoryExitPort;
import com.mylab.backend.inventory.application.port.out.InventoryMovementRepositoryPort;
import com.mylab.backend.inventory.application.port.out.InventoryLaboratoryLookupPort;
import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;
import com.mylab.backend.inventory.domain.model.InventoryMovement;
import com.mylab.backend.inventory.domain.model.InventoryMovementType;

@Service
@RequiredArgsConstructor
public class ReverseInventoryExitUsecase implements ReverseInventoryExitPort {
    private final InventoryMovementRepositoryPort movementRepository;
    private final InventoryLaboratoryLookupPort laboratoryLookup;

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void reverse(UUID exitId, ReverseInventoryExitInput input) {
        Objects.requireNonNull(exitId, "exitId must not be null");
        if (input == null || input.reason() == null || input.reason().isBlank()) {
            throw new InvalidInventoryException("reversal reason must not be blank");
        }

        InventoryMovement exit = movementRepository.findByIdForUpdate(exitId)
                .filter(candidate -> candidate.type() == InventoryMovementType.EXIT)
                .orElseThrow(() -> new InventoryExitNotFoundException(exitId));

        InventoryMovement reversed = exit.reverse(input.reason(), LocalDateTime.now());
        laboratoryLookup.lockForStockUpdate(exit.sourceLaboratoryId());
        movementRepository.save(reversed);
    }
}

