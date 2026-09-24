package com.mylab.backend.groupmember.infrastructure.adapters.in.rest;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.mylab.backend.groupmember.application.port.in.CreateGroupMemberPort;
import com.mylab.backend.groupmember.application.port.in.GetAllGroupMembersPort;
import com.mylab.backend.groupmember.application.port.in.GetGroupMemberPort;
import com.mylab.backend.groupmember.application.port.in.UpdateGroupMemberPort;
import com.mylab.backend.groupmember.infrastructure.adapters.in.rest.dto.CreateGroupMemberRequest;
import com.mylab.backend.groupmember.infrastructure.adapters.in.rest.dto.GroupMemberResponse;
import com.mylab.backend.groupmember.infrastructure.adapters.in.rest.dto.UpdateGroupMemberRequest;
import com.mylab.backend.groupmember.infrastructure.adapters.in.rest.mapper.GroupMemberRestMapper;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
public class GroupMemberController {

    private final CreateGroupMemberPort createGroupMemberPort;
    private final UpdateGroupMemberPort updateGroupMemberPort;
    private final GetGroupMemberPort getGroupMemberPort;
    private final GetAllGroupMembersPort getAllGroupMembersPort;
    private final GroupMemberRestMapper mapper;

    @GetMapping("/api/v1/research-groups/{researchGroupId}/members")
    public List<GroupMemberResponse> getAllMembersByGroup(@PathVariable UUID researchGroupId) {
        log.info("REST GET: list members for research group: {}", researchGroupId);
        return mapper.toResponseList(getAllGroupMembersPort.getAllByResearchGroup(researchGroupId));
    }

    @PostMapping("/api/v1/research-groups/{researchGroupId}/members")
    public ResponseEntity<Void> createMember(
            @PathVariable UUID researchGroupId,
            @Valid @RequestBody CreateGroupMemberRequest request) {
        UUID id = createGroupMemberPort.create(mapper.toInput(researchGroupId, request));
        log.info("REST POST: create/reactivate member for research group: {}", researchGroupId);
        return ResponseEntity.created(URI.create("/api/v1/members/" + id)).build();
    }

    @PatchMapping("/api/v1/research-groups/{researchGroupId}/members/{personId}")
    public ResponseEntity<Void> updateMember(
            @PathVariable UUID researchGroupId,
            @PathVariable UUID personId,
            @Valid @RequestBody UpdateGroupMemberRequest request) {
        log.info("REST PATCH: update member {} for research group {}", personId, researchGroupId);
        updateGroupMemberPort.update(researchGroupId, personId, mapper.toInput(request));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/v1/people/{personId}/members")
    public List<GroupMemberResponse> getAllMembersByPerson(@PathVariable UUID personId) {
        log.info("REST GET: list memberships for person: {}", personId);
        return mapper.toResponseList(getAllGroupMembersPort.getAllByPerson(personId));
    }

    @GetMapping("/api/v1/members/{id}")
    public GroupMemberResponse getMemberById(@PathVariable UUID id) {
        log.info("REST GET: find group member by ID: {}", id);
        return mapper.toResponse(getGroupMemberPort.get(id));
    }
}
