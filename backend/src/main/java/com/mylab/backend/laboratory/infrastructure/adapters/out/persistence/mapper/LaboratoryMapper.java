package com.mylab.backend.laboratory.infrastructure.adapters.out.persistence.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.mylab.backend.laboratory.domain.model.Laboratory;
import com.mylab.backend.laboratory.domain.valueobject.LaboratoryAddress;
import com.mylab.backend.laboratory.infrastructure.adapters.out.persistence.entity.LaboratoryAddressEmbeddable;
import com.mylab.backend.laboratory.infrastructure.adapters.out.persistence.entity.LaboratoryEntity;

@Component
public class LaboratoryMapper {

    public Laboratory toDomain(LaboratoryEntity entity) {
        if (entity == null) {
            return null;
        }

        return Laboratory.builder()
                .id(entity.getId())
                .researchGroupId(entity.getResearchGroupId())
                .name(entity.getName())
                .address(toDomain(entity.getAddress()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .deletedAt(entity.getDeletedAt())
                .build();
    }

    public LaboratoryEntity toEntity(Laboratory domain) {
        if (domain == null) {
            return null;
        }

        return LaboratoryEntity.builder()
                .id(domain.getId())
                .researchGroupId(domain.getResearchGroupId())
                .name(domain.getName())
                .address(toEntity(domain.getAddress()))
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .deletedAt(domain.getDeletedAt())
                .build();
    }

    public List<Laboratory> toDomainList(List<LaboratoryEntity> entities) {
        if (entities == null) {
            return List.of();
        }
        return entities.stream().map(this::toDomain).collect(Collectors.toList());
    }

    private LaboratoryAddress toDomain(LaboratoryAddressEmbeddable address) {
        if (address == null) {
            return null;
        }
        return LaboratoryAddress.builder()
                .street(address.getStreet())
                .number(address.getNumber())
                .city(address.getCity())
                .postalCode(address.getPostalCode())
                .build();
    }

    private LaboratoryAddressEmbeddable toEntity(LaboratoryAddress address) {
        if (address == null) {
            return null;
        }
        return LaboratoryAddressEmbeddable.builder()
                .street(address.getStreet())
                .number(address.getNumber())
                .city(address.getCity())
                .postalCode(address.getPostalCode())
                .build();
    }
}
