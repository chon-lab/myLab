package com.mylab.backend.laboratory.infrastructure.adapters.in.rest.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateLaboratoryRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    @Valid
    private LaboratoryAddressRequest address;
}
