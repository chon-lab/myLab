package com.mylab.backend.common.infrastructure.adapters.out.persistence.entity;

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
@Table(name = "contact")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ContactEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(length = 30)
    private String phone;

    @Column(length = 30)
    private String fax;

    @Column(length = 254)
    private String email;

    @Column(length = 2048)
    private String website;
}
