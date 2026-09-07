package com.mylab.backend.laboratory.infrastructure.adapters.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LaboratoryAddressEmbeddable {

    @Column(name = "address_street", length = 255)
    private String street;

    @Column(name = "address_number", length = 30)
    private String number;

    @Column(name = "address_city", length = 120)
    private String city;

    @Column(name = "address_postal_code", length = 8)
    private String postalCode;
}
