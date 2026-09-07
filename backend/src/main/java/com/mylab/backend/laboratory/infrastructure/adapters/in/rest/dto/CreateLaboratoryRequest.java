package com.mylab.backend.laboratory.infrastructure.adapters.in.rest.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.mylab.backend.laboratory.domain.model.LaboratoryStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateLaboratoryRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    @Size(max = 1000)
    private String description;

    private LaboratoryStatus status = LaboratoryStatus.ACTIVE;

    @Valid
    private LaboratoryAddressRequest address;
}
