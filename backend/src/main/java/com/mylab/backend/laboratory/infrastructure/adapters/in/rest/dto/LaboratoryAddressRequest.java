package com.mylab.backend.laboratory.infrastructure.adapters.in.rest.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LaboratoryAddressRequest {

    @Size(max = 255)
    private String street;

    @Size(max = 30)
    private String number;

    @Size(max = 120)
    private String city;

    @Pattern(regexp = "^$|^\\d{5}-?\\d{3}$", message = "must contain eight digits")
    private String postalCode;
}
