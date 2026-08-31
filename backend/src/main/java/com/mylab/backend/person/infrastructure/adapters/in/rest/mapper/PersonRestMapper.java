package com.mylab.backend.person.infrastructure.adapters.in.rest.mapper;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.mylab.backend.person.application.dto.CreatePersonInput;
import com.mylab.backend.person.application.dto.UpdatePersonInput;
import com.mylab.backend.person.domain.model.Person;
import com.mylab.backend.person.infrastructure.adapters.in.rest.dto.CreatePersonRequest;
import com.mylab.backend.person.infrastructure.adapters.in.rest.dto.PersonResponse;
import com.mylab.backend.person.infrastructure.adapters.in.rest.dto.UpdatePersonRequest;

@Component
public class PersonRestMapper {

    public CreatePersonInput toInput(UUID researchGroupId, CreatePersonRequest request) {
        return new CreatePersonInput(
                researchGroupId,
                request.getName(),
                request.getSocialName(),
                request.getEmail(),
                request.getPhone(),
                request.getCpf(),
                request.getAcademicDegree(),
                request.getAreasOfExpertise(),
                request.getResearchLineIds()
        );
    }

    public UpdatePersonInput toInput(UpdatePersonRequest request) {
        return new UpdatePersonInput(
                request.getName(),
                request.getSocialName(),
                request.getEmail(),
                request.getPhone(),
                request.getCpf(),
                request.getAcademicDegree(),
                request.getAreasOfExpertise(),
                request.getResearchLineIds()
        );
    }

    public PersonResponse toResponse(Person domain) {
        if (domain == null) {
            return null;
        }

        return new PersonResponse(
                domain.getId(),
                domain.getResearchGroupId(),
                domain.getName(),
                domain.getSocialName(),
                domain.getEmail(),
                domain.getPhone(),
                domain.getCpf(),
                domain.getAcademicDegree(),
                domain.getAreasOfExpertise(),
                domain.getResearchLineIds(),
                domain.getCreatedAt(),
                domain.getUpdatedAt()
        );
    }

    public List<PersonResponse> toResponseList(List<Person> domains) {
        if (domains == null) {
            return List.of();
        }

        return domains.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}
