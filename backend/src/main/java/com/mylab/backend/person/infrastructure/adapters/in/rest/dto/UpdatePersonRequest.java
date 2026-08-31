package com.mylab.backend.person.infrastructure.adapters.in.rest.dto;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdatePersonRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    @Size(max = 255)
    private String socialName;

    @Email
    @Size(max = 254)
    private String email;

    @Size(max = 30)
    private String phone;

    @Size(max = 14)
    private String cpf;

    @Size(max = 100)
    private String academicDegree;

    private List<@NotBlank @Size(max = 500) String> areasOfExpertise;

    private List<UUID> researchLineIds;
}
