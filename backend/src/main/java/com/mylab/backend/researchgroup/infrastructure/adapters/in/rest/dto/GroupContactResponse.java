package com.mylab.backend.researchgroup.infrastructure.adapters.in.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupContactResponse {

    private String phone;
    private String fax;
    private String email;
    private String website;
}
