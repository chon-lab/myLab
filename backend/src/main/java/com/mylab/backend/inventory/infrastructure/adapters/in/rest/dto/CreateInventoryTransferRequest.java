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

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateInventoryTransferRequest {
    @NotNull
    private UUID sourceLaboratoryId;

    @NotNull
    private UUID destinationLaboratoryId;

    @NotNull
    private LocalDate transferredAt;

    @Size(max = 4000)
    private String notes;

    @NotEmpty
    @Size(max = 200)
    @Valid
    private List<@NotNull @Valid CreateInventoryTransferItemRequest> items;
}

