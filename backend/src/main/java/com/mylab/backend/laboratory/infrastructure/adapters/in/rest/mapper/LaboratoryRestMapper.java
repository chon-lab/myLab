package com.mylab.backend.laboratory.infrastructure.adapters.in.rest.mapper;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.mylab.backend.laboratory.application.dto.CreateLaboratoryInput;
import com.mylab.backend.laboratory.application.dto.UpdateLaboratoryInput;
import com.mylab.backend.laboratory.domain.model.Laboratory;
import com.mylab.backend.laboratory.domain.valueobject.LaboratoryAddress;
import com.mylab.backend.laboratory.infrastructure.adapters.in.rest.dto.CreateLaboratoryRequest;
import com.mylab.backend.laboratory.infrastructure.adapters.in.rest.dto.LaboratoryAddressRequest;
import com.mylab.backend.laboratory.infrastructure.adapters.in.rest.dto.LaboratoryAddressResponse;
import com.mylab.backend.laboratory.infrastructure.adapters.in.rest.dto.LaboratoryResponse;
import com.mylab.backend.laboratory.infrastructure.adapters.in.rest.dto.UpdateLaboratoryRequest;

@Component
public class LaboratoryRestMapper {

    public CreateLaboratoryInput toInput(UUID researchGroupId, CreateLaboratoryRequest request) {
        return new CreateLaboratoryInput(researchGroupId, request.getName(), toDomain(request.getAddress()));
    }

    public UpdateLaboratoryInput toInput(UpdateLaboratoryRequest request) {
        return new UpdateLaboratoryInput(request.getName(), toDomain(request.getAddress()));
    }

    public LaboratoryResponse toResponse(Laboratory domain) {
        if (domain == null) {
            return null;
        }
        return new LaboratoryResponse(
                domain.getId(),
                domain.getResearchGroupId(),
                domain.getName(),
                toResponse(domain.getAddress()),
                domain.getCreatedAt(),
                domain.getUpdatedAt()
        );
    }

    public List<LaboratoryResponse> toResponseList(List<Laboratory> domains) {
        if (domains == null) {
            return List.of();
        }
        return domains.stream().map(this::toResponse).collect(Collectors.toList());
    }

    private LaboratoryAddress toDomain(LaboratoryAddressRequest request) {
        if (request == null) {
            return null;
        }
        if (isBlank(request.getStreet())
                && isBlank(request.getNumber())
                && isBlank(request.getCity())
                && isBlank(request.getPostalCode())) {
            return null;
        }
        return LaboratoryAddress.builder()
                .street(request.getStreet())
                .number(request.getNumber())
                .city(request.getCity())
                .postalCode(request.getPostalCode())
                .build();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private LaboratoryAddressResponse toResponse(LaboratoryAddress address) {
        if (address == null) {
            return null;
        }
        return new LaboratoryAddressResponse(
                address.getStreet(), address.getNumber(), address.getCity(), address.getPostalCode());
    }
}
