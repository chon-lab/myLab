package com.mylab.backend.laboratory.domain.valueobject;

import com.mylab.backend.laboratory.domain.exception.InvalidLaboratoryException;
import lombok.Builder;
import lombok.Value;

@Value
public class LaboratoryAddress {
    String street;
    String number;
    String city;
    String postalCode;

    @Builder
    public LaboratoryAddress(String street, String number, String city, String postalCode) {
        this.street = normalize(street);
        this.number = normalize(number);
        this.city = normalize(city);
        this.postalCode = validatePostalCode(postalCode);
    }

    public boolean isEmpty() {
        return street == null && number == null && city == null && postalCode == null;
    }

    private static String normalize(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private static String validatePostalCode(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String digits = value.replaceAll("[\\s.-]", "");
        if (!digits.matches("\\d{8}")) {
            throw new InvalidLaboratoryException("postalCode must contain eight digits");
        }
        return digits;
    }
}
