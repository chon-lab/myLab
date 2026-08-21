package com.mylab.backend.researchgroup.domain.valueobjects;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class GroupContact {
    String phone;
    String fax;
    String email;
    String website;
}
