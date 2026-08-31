package com.mylab.backend.researchline.infrastructure.adapters.in.rest.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateResearchLineRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    @NotBlank
    private String objective;

    private List<@NotBlank @Size(max = 255) String> keywords;

    private List<@NotBlank @Size(max = 500) String> knowledgeAreas;

    private List<@NotBlank @Size(max = 255) String> applicationSectors;
}
