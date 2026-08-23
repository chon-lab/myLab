package com.mylab.backend.researchgroup.infrastructure.adapters.in.rest.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupAddressRequest {

    @Size(max = 255)
    private String street;

    @Size(max = 30)
    private String number;

    @Size(max = 255)
    private String complement;

    @Size(max = 120)
    private String neighborhood;

    @Pattern(regexp = "(?i)^[A-Z]{2}$", message = "must contain a two-letter state code")
    private String state;

    @Size(max = 120)
    private String city;

    @Size(max = 8)
    private String postalCode;

    @Size(max = 30)
    private String postOfficeBox;

    @DecimalMin("-90.0")
    @DecimalMax("90.0")
    private BigDecimal latitude;

    @DecimalMin("-180.0")
    @DecimalMax("180.0")
    private BigDecimal longitude;
}
