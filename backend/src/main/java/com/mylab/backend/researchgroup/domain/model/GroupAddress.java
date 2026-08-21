package com.mylab.backend.researchgroup.domain.model;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class GroupAddress {
    String street;
    String number;
    String complement;
    String neighborhood;
    String state;
    String city;
    String postalCode;
    String postOfficeBox;
    BigDecimal latitude;
    BigDecimal longitude;
}
