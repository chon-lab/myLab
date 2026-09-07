package com.mylab.backend.laboratory.infrastructure.adapters.in.rest.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LaboratoryResponse {
    private UUID id;
    private UUID researchGroupId;
    private String name;
    private LaboratoryAddressResponse address;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
