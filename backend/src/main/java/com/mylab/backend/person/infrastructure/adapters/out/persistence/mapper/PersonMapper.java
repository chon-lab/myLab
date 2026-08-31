package com.mylab.backend.person.infrastructure.adapters.out.persistence.mapper;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.mylab.backend.person.domain.model.Person;
import com.mylab.backend.person.infrastructure.adapters.out.persistence.entity.PersonEntity;

@Component
public class PersonMapper {

    public Person toDomain(PersonEntity entity) {
        if (entity == null) {
            return null;
        }

        return Person.builder()
                .id(entity.getId())
                .researchGroupId(entity.getResearchGroupId())
                .name(entity.getName())
                .socialName(entity.getSocialName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .cpf(entity.getCpf())
                .academicDegree(entity.getAcademicDegree())
                .areasOfExpertise(entity.getAreasOfExpertise())
                .researchLineIds(entity.getResearchLineIds())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .deletedAt(entity.getDeletedAt())
                .build();
    }

    public PersonEntity toEntity(Person domain) {
        if (domain == null) {
            return null;
        }

        return PersonEntity.builder()
                .id(domain.getId())
                .researchGroupId(domain.getResearchGroupId())
                .name(domain.getName())
                .socialName(domain.getSocialName())
                .email(domain.getEmail())
                .phone(domain.getPhone())
                .cpf(domain.getCpf())
                .academicDegree(domain.getAcademicDegree())
                .areasOfExpertise(new ArrayList<>(domain.getAreasOfExpertise()))
                .researchLineIds(new HashSet<>(domain.getResearchLineIds()))
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .deletedAt(domain.getDeletedAt())
                .build();
    }

    public List<Person> toDomainList(List<PersonEntity> entities) {
        if (entities == null) {
            return List.of();
        }

        return entities.stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }
}
