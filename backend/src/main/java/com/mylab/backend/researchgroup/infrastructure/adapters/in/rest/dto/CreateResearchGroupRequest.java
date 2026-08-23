package com.mylab.backend.researchgroup.infrastructure.adapters.in.rest.dto;

import java.time.LocalDateTime;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateResearchGroupRequest {

    @NotBlank
    @Size(max = 64)
    private String cnpqId;

    @NotBlank
    @Size(max = 255)
    private String name;

    @NotBlank
    @Size(max = 50)
    private String situation;

    @Min(1)
    private int formationYear;

    private LocalDateTime situationAt;
    private LocalDateTime lastSubmittedAt;

    @NotBlank
    @Size(max = 500)
    private String predominantArea;

    @NotBlank
    @Size(max = 255)
    private String institutionName;

    @Size(max = 255)
    private String institutionUnit;

    @Size(max = 2048)
    private String sourceUrl;

    private String repercussions;

    @Valid
    private GroupAddressRequest address;

    @Valid
    private GroupContactRequest contact;
}
