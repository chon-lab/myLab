package com.mylab.backend.researchgroup.infrastructure.adapters.in.rest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupContactRequest {

    @Size(max = 30)
    private String phone;

    @Size(max = 30)
    private String fax;

    @Email
    @Size(max = 254)
    private String email;

    @Size(max = 2048)
    private String website;
}
