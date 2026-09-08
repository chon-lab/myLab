package com.mylab.backend.researchgroup.infrastructure.adapters.out.persistence.mapper;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.mylab.backend.common.infrastructure.adapters.out.persistence.entity.AddressEntity;
import com.mylab.backend.common.infrastructure.adapters.out.persistence.entity.ContactEntity;
import com.mylab.backend.researchgroup.domain.model.ResearchGroup;
import com.mylab.backend.researchgroup.domain.valueobjects.GroupAddress;
import com.mylab.backend.researchgroup.domain.valueobjects.GroupContact;
import com.mylab.backend.researchgroup.infrastructure.adapters.out.persistence.entity.ResearchGroupEntity;

@Component
public class ResearchGroupMapper {

    public ResearchGroup toDomain(ResearchGroupEntity entity) {
        if (entity == null) {
            return null;
        }

        return ResearchGroup.builder()
                .id(entity.getId())
                .cnpqId(entity.getCnpqId())
                .name(entity.getName())
                .situation(entity.getSituation())
                .formationYear(entity.getFormationYear())
                .situationAt(entity.getSituationAt())
                .lastSubmittedAt(entity.getLastSubmittedAt())
                .predominantArea(entity.getPredominantArea())
                .institutionName(entity.getInstitutionName())
                .institutionUnit(entity.getInstitutionUnit())
                .sourceUrl(entity.getSourceUrl())
                .repercussions(entity.getRepercussions())
                .address(toDomain(entity.getAddress()))
                .contacts(toDomainContacts(entity.getContacts()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .deletedAt(entity.getDeletedAt())
                .build();
    }

    public ResearchGroupEntity toEntity(ResearchGroup domain) {
        if (domain == null) {
            return null;
        }

        return ResearchGroupEntity.builder()
                .id(domain.getId())
                .cnpqId(domain.getCnpqId())
                .name(domain.getName())
                .situation(domain.getSituation())
                .formationYear(domain.getFormationYear())
                .situationAt(domain.getSituationAt())
                .lastSubmittedAt(domain.getLastSubmittedAt())
                .predominantArea(domain.getPredominantArea())
                .institutionName(domain.getInstitutionName())
                .institutionUnit(domain.getInstitutionUnit())
                .sourceUrl(domain.getSourceUrl())
                .repercussions(domain.getRepercussions())
                .address(toEntity(domain.getAddress()))
                .contacts(toEntityContacts(domain.getContacts()))
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .deletedAt(domain.getDeletedAt())
                .build();
    }

    public List<ResearchGroup> toDomainList(List<ResearchGroupEntity> entities) {
        if (entities == null) {
            return List.of();
        }

        return entities.stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    private List<GroupContact> toDomainContacts(List<ContactEntity> entities) {
        if (entities == null) {
            return List.of();
        }

        return entities.stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    private List<ContactEntity> toEntityContacts(List<GroupContact> domains) {
        if (domains == null) {
            return List.of();
        }

        return domains.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }

    private GroupAddress toDomain(AddressEntity entity) {
        if (entity == null) {
            return null;
        }

        return GroupAddress.builder()
                .street(entity.getStreet())
                .number(entity.getNumber())
                .complement(entity.getComplement())
                .neighborhood(entity.getNeighborhood())
                .state(entity.getState())
                .city(entity.getCity())
                .postalCode(entity.getPostalCode())
                .postOfficeBox(entity.getPostOfficeBox())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .build();
    }

    private GroupContact toDomain(ContactEntity entity) {
        if (entity == null) {
            return null;
        }

        return GroupContact.builder()
                .phone(entity.getPhone())
                .fax(entity.getFax())
                .email(entity.getEmail())
                .website(entity.getWebsite())
                .build();
    }

    private AddressEntity toEntity(GroupAddress domain) {
        if (domain == null) {
            return null;
        }

        return AddressEntity.builder()
                .id(UUID.randomUUID())
                .street(domain.getStreet())
                .number(domain.getNumber())
                .complement(domain.getComplement())
                .neighborhood(domain.getNeighborhood())
                .state(domain.getState())
                .city(domain.getCity())
                .postalCode(domain.getPostalCode())
                .postOfficeBox(domain.getPostOfficeBox())
                .latitude(domain.getLatitude())
                .longitude(domain.getLongitude())
                .build();
    }

    private ContactEntity toEntity(GroupContact domain) {
        if (domain == null) {
            return null;
        }

        return ContactEntity.builder()
                .id(UUID.randomUUID())
                .phone(domain.getPhone())
                .fax(domain.getFax())
                .email(domain.getEmail())
                .website(domain.getWebsite())
                .build();
    }
}
