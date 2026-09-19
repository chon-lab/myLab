package com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.mylab.backend.inventory.domain.model.InventoryExitType;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateInventoryExitRequest {
    @NotNull
    private UUID laboratoryId;

    @NotNull
    private InventoryExitType type;

    @NotNull
    private LocalDate occurredAt;

    @Size(max = 4000)
    private String notes;

    @NotEmpty
    @Size(max = 200)
    @Valid
    private List<@NotNull @Valid CreateInventoryExitItemRequest> items;
}

