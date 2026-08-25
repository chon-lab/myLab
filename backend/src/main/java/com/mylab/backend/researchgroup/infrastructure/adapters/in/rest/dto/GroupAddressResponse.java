package com.mylab.backend.researchgroup.infrastructure.adapters.in.rest.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupAddressResponse {

    private String street;
    private String number;
    private String complement;
    private String neighborhood;
    private String state;
    private String city;
    private String postalCode;
    private String postOfficeBox;
    private BigDecimal latitude;
    private BigDecimal longitude;
}
