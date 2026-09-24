package com.mylab.backend.groupmember.infrastructure.adapters.in.rest.mapper;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.mylab.backend.groupmember.application.dto.CreateGroupMemberInput;
import com.mylab.backend.groupmember.application.dto.UpdateGroupMemberInput;
import com.mylab.backend.groupmember.domain.model.GroupMember;
import com.mylab.backend.groupmember.infrastructure.adapters.in.rest.dto.CreateGroupMemberRequest;
import com.mylab.backend.groupmember.infrastructure.adapters.in.rest.dto.GroupMemberResponse;
import com.mylab.backend.groupmember.infrastructure.adapters.in.rest.dto.UpdateGroupMemberRequest;

@Component
public class GroupMemberRestMapper {

    public CreateGroupMemberInput toInput(UUID researchGroupId, CreateGroupMemberRequest request) {
        return new CreateGroupMemberInput(
                researchGroupId,
                request.getPersonId(),
                request.getResearchLineIds()
        );
    }

    public UpdateGroupMemberInput toInput(UpdateGroupMemberRequest request) {
        return new UpdateGroupMemberInput(
                request.getActive(),
                request.getResearchLineIds()
        );
    }

    public GroupMemberResponse toResponse(GroupMember domain) {
        if (domain == null) {
            return null;
        }

        return new GroupMemberResponse(
                domain.getId(),
                domain.getPersonId(),
                domain.getResearchGroupId(),
                domain.isActive(),
                domain.getResearchLineIds(),
                domain.getCreatedAt(),
                domain.getUpdatedAt()
        );
    }

    public List<GroupMemberResponse> toResponseList(List<GroupMember> domains) {
        if (domains == null) {
            return List.of();
        }

        return domains.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}
