package com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.mylab.backend.inventory.domain.model.InventoryEntrySource;

@Data
@NoArgsConstructor
public class CreateInventoryEntryRequest {
    @NotNull
    private UUID laboratoryId;

    @NotNull
    private InventoryEntrySource source;

    @NotBlank
    @Size(max = 255)
    private String sourceName;

    @NotNull
    private LocalDate receivedAt;

    @Size(max = 4000)
    private String notes;

    @NotEmpty
    @Size(max = 200)
    @Valid
    private List<@NotNull @Valid CreateInventoryEntryItemRequest> items;
}
