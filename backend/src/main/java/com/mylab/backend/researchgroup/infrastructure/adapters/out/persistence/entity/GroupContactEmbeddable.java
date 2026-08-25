package com.mylab.backend.researchgroup.infrastructure.adapters.out.persistence.entity;

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
public class GroupContactEmbeddable {

    @Column(name = "contact_phone", length = 30)
    private String phone;

    @Column(name = "contact_fax", length = 30)
    private String fax;

    @Column(name = "contact_email", length = 254)
    private String email;

    @Column(name = "contact_website", length = 2048)
    private String website;
}
