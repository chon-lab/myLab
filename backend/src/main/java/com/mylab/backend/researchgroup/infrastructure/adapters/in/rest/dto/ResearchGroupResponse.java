package com.mylab.backend.researchgroup.infrastructure.adapters.in.rest.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResearchGroupResponse {

    private UUID id;
    private String cnpqId;
    private String name;
    private String situation;
    private int formationYear;
    private LocalDateTime situationAt;
    private LocalDateTime lastSubmittedAt;
    private String predominantArea;
    private String institutionName;
    private String institutionUnit;
    private String sourceUrl;
    private String repercussions;
    private GroupAddressResponse address;
    private GroupContactResponse contact;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
