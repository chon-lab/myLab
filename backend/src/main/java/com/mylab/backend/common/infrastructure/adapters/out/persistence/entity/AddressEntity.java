package com.mylab.backend.common.infrastructure.adapters.out.persistence.entity;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "address")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AddressEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(length = 255)
    private String street;

    @Column(length = 30)
    private String number;

    @Column(length = 255)
    private String complement;

    @Column(length = 120)
    private String neighborhood;

    @Column(length = 2)
    private String state;

    @Column(length = 120)
    private String city;

    @Column(name = "postal_code", length = 8)
    private String postalCode;

    @Column(name = "post_office_box", length = 30)
    private String postOfficeBox;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;
}
