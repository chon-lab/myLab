package com.mylab.backend.laboratory.infrastructure.adapters.in.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LaboratoryAddressResponse {
    private String street;
    private String number;
    private String city;
    private String postalCode;
}
