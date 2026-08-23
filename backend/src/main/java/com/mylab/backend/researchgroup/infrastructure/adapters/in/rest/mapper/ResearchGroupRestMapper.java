package com.mylab.backend.researchgroup.infrastructure.adapters.in.rest.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.mylab.backend.researchgroup.application.dto.CreateResearchGroupInput;
import com.mylab.backend.researchgroup.application.dto.UpdateResearchGroupInput;
import com.mylab.backend.researchgroup.domain.model.ResearchGroup;
import com.mylab.backend.researchgroup.domain.valueobjects.GroupAddress;
import com.mylab.backend.researchgroup.domain.valueobjects.GroupContact;
import com.mylab.backend.researchgroup.infrastructure.adapters.in.rest.dto.CreateResearchGroupRequest;
import com.mylab.backend.researchgroup.infrastructure.adapters.in.rest.dto.GroupAddressRequest;
import com.mylab.backend.researchgroup.infrastructure.adapters.in.rest.dto.GroupAddressResponse;
import com.mylab.backend.researchgroup.infrastructure.adapters.in.rest.dto.GroupContactRequest;
import com.mylab.backend.researchgroup.infrastructure.adapters.in.rest.dto.GroupContactResponse;
import com.mylab.backend.researchgroup.infrastructure.adapters.in.rest.dto.ResearchGroupResponse;
import com.mylab.backend.researchgroup.infrastructure.adapters.in.rest.dto.UpdateResearchGroupRequest;

@Component
public class ResearchGroupRestMapper {

    public CreateResearchGroupInput toInput(CreateResearchGroupRequest request) {
        return new CreateResearchGroupInput(
                request.getCnpqId(),
                request.getName(),
                request.getSituation(),
                request.getFormationYear(),
                request.getSituationAt(),
                request.getLastSubmittedAt(),
                request.getPredominantArea(),
                request.getInstitutionName(),
                request.getInstitutionUnit(),
                request.getSourceUrl(),
                request.getRepercussions(),
                toDomain(request.getAddress()),
                toDomain(request.getContact())
        );
    }

    public UpdateResearchGroupInput toInput(UpdateResearchGroupRequest request) {
        return new UpdateResearchGroupInput(
                request.getName(),
                request.getSituation(),
                request.getFormationYear(),
                request.getSituationAt(),
                request.getLastSubmittedAt(),
                request.getPredominantArea(),
                request.getInstitutionName(),
                request.getInstitutionUnit(),
                request.getSourceUrl(),
                request.getRepercussions(),
                toDomain(request.getAddress()),
                toDomain(request.getContact())
        );
    }

    public ResearchGroupResponse toResponse(ResearchGroup domain) {
        if (domain == null) {
            return null;
        }

        return new ResearchGroupResponse(
                domain.getId(),
                domain.getCnpqId(),
                domain.getName(),
                domain.getSituation(),
                domain.getFormationYear(),
                domain.getSituationAt(),
                domain.getLastSubmittedAt(),
                domain.getPredominantArea(),
                domain.getInstitutionName(),
                domain.getInstitutionUnit(),
                domain.getSourceUrl(),
                domain.getRepercussions(),
                toResponse(domain.getAddress()),
                toResponse(domain.getContact()),
                domain.getCreatedAt(),
                domain.getUpdatedAt()
        );
    }

    public List<ResearchGroupResponse> toResponseList(List<ResearchGroup> domains) {
        if (domains == null) {
            return List.of();
        }

        return domains.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private GroupAddress toDomain(GroupAddressRequest request) {
        if (request == null) {
            return null;
        }

        return GroupAddress.builder()
                .street(request.getStreet())
                .number(request.getNumber())
                .complement(request.getComplement())
                .neighborhood(request.getNeighborhood())
                .state(request.getState())
                .city(request.getCity())
                .postalCode(request.getPostalCode())
                .postOfficeBox(request.getPostOfficeBox())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();
    }

    private GroupContact toDomain(GroupContactRequest request) {
        if (request == null) {
            return null;
        }

        return GroupContact.builder()
                .phone(request.getPhone())
                .fax(request.getFax())
                .email(request.getEmail())
                .website(request.getWebsite())
                .build();
    }

    private GroupAddressResponse toResponse(GroupAddress domain) {
        if (domain == null) {
            return null;
        }

        return new GroupAddressResponse(
                domain.getStreet(),
                domain.getNumber(),
                domain.getComplement(),
                domain.getNeighborhood(),
                domain.getState(),
                domain.getCity(),
                domain.getPostalCode(),
                domain.getPostOfficeBox(),
                domain.getLatitude(),
                domain.getLongitude()
        );
    }

    private GroupContactResponse toResponse(GroupContact domain) {
        if (domain == null) {
            return null;
        }

        return new GroupContactResponse(
                domain.getPhone(),
                domain.getFax(),
                domain.getEmail(),
                domain.getWebsite()
        );
    }
}
