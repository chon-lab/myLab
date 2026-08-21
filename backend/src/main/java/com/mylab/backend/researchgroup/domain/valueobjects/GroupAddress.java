package com.mylab.backend.researchgroup.domain.valueobjects;

import java.math.BigDecimal;

import com.mylab.backend.researchgroup.domain.exception.InvalidGroupAddressException;

import lombok.Builder;
import lombok.Value;

@Value

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

    @Builder
    public GroupAddress(
            String street,
            String number,
            String complement,
            String neighborhood,
            String state,
            String city,
            String postalCode,
            String postOfficeBox,
            BigDecimal latitude,
            BigDecimal longitude) {
        this.street = street;
        this.number = number;
        this.complement = complement;
        this.neighborhood = neighborhood;
        this.state = state;
        this.city = city;
        this.postalCode = validatePostalCode(postalCode);
        this.postOfficeBox = postOfficeBox;
        this.latitude = latitude;
        this.longitude = longitude;
}

private static String validatePostalCode(String postalCode) {
    String value = postalCode;

    if (value == null) {
        return null;
    }

    String digits = value.replaceAll("[\\s.-]", "");

    if (!digits.matches("\\d{8}")) {
        throw new InvalidGroupAddressException(
                "postalCode must contain eight digits"
        );
    }

    return digits;
}

}
