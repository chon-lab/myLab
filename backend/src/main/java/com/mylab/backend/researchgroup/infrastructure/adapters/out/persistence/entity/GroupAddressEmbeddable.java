package com.mylab.backend.researchgroup.infrastructure.adapters.out.persistence.entity;

import java.math.BigDecimal;

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
public class GroupAddressEmbeddable {

    @Column(name = "address_street", length = 255)
    private String street;

    @Column(name = "address_number", length = 30)
    private String number;

    @Column(name = "address_complement", length = 255)
    private String complement;

    @Column(name = "address_neighborhood", length = 120)
    private String neighborhood;

    @Column(name = "address_state", length = 2)
    private String state;

    @Column(name = "address_city", length = 120)
    private String city;

    @Column(name = "address_postal_code", length = 8)
    private String postalCode;

    @Column(name = "address_post_office_box", length = 30)
    private String postOfficeBox;

    @Column(name = "address_latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "address_longitude", precision = 10, scale = 7)
    private BigDecimal longitude;
}
