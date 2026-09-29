package com.mylab.backend.person.infrastructure.adapters.in.rest.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PersonResponse {

    private UUID id;
    private String name;
    private String socialName;
    private String email;
    private String phone;
    private String cpf;
    private String academicDegree;
    private List<String> areasOfExpertise;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
