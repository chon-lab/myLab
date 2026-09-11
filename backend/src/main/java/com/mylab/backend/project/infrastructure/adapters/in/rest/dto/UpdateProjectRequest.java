package com.mylab.backend.project.infrastructure.adapters.in.rest.dto;

import java.time.LocalDate;
import java.util.List;

import com.mylab.backend.project.domain.model.ProjectStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProjectRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    @Size(max = 1000)
    private String description;

    @NotBlank
    private String objective;

    @NotNull
    private ProjectStatus status;

    @NotNull
    private LocalDate startDate;

    private LocalDate endDate;

    private List<@NotBlank @Size(max = 500) String> knowledgeAreas;
}
