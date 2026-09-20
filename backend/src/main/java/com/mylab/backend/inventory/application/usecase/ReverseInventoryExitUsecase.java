package com.mylab.backend.inventory.application.usecase;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.ReverseInventoryExitInput;
import com.mylab.backend.inventory.application.exception.InventoryExitNotFoundException;
import com.mylab.backend.inventory.application.port.in.ReverseInventoryExitPort;
import com.mylab.backend.inventory.application.port.out.InventoryExitRepositoryPort;
import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;
import com.mylab.backend.inventory.domain.model.InventoryExit;

@Service
@RequiredArgsConstructor
public class ReverseInventoryExitUsecase implements ReverseInventoryExitPort {
    private final InventoryExitRepositoryPort exitRepository;

    @Override
    @Transactional
    public void reverse(UUID exitId, ReverseInventoryExitInput input) {
        Objects.requireNonNull(exitId, "exitId must not be null");
        if (input == null || input.reason() == null || input.reason().isBlank()) {
            throw new InvalidInventoryException("reversal reason must not be blank");
        }

        InventoryExit exit = exitRepository.findById(exitId)
                .orElseThrow(() -> new InventoryExitNotFoundException(exitId));

        InventoryExit reversed = exit.reverse(input.reason(), LocalDateTime.now());
        exitRepository.save(reversed);
    }
}

