package com.mylab.backend.researchgroup.infrastructure.adapters.in.rest;

import java.net.URI;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mylab.backend.common.infrastructure.auth.CurrentPersonProvider;
import com.mylab.backend.groupmember.application.port.out.GroupMemberRepositoryPort;
import com.mylab.backend.groupmember.domain.model.GroupMember;
import com.mylab.backend.researchgroup.application.port.in.CreateResearchGroupPort;
import com.mylab.backend.researchgroup.application.port.in.DeleteResearchGroupPort;
import com.mylab.backend.researchgroup.application.port.in.GetAllResearchGroupPort;
import com.mylab.backend.researchgroup.application.port.in.GetResearchGroupPort;
import com.mylab.backend.researchgroup.application.port.in.UpdateResearchGroupPort;
import com.mylab.backend.researchgroup.domain.model.ResearchGroup;
import com.mylab.backend.researchgroup.infrastructure.adapters.in.rest.dto.CreateResearchGroupRequest;
import com.mylab.backend.researchgroup.infrastructure.adapters.in.rest.dto.ResearchGroupResponse;
import com.mylab.backend.researchgroup.infrastructure.adapters.in.rest.dto.UpdateResearchGroupRequest;
import com.mylab.backend.researchgroup.infrastructure.adapters.in.rest.mapper.ResearchGroupRestMapper;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/research-groups")
@RequiredArgsConstructor
@Slf4j
public class ResearchGroupController {

    private final CreateResearchGroupPort createResearchGroupPort;
    private final UpdateResearchGroupPort updateResearchGroupPort;
    private final DeleteResearchGroupPort deleteResearchGroupPort;
    private final GetResearchGroupPort getResearchGroupPort;
    private final GetAllResearchGroupPort getAllResearchGroupPort;
    private final GroupMemberRepositoryPort groupMemberRepositoryPort;
    private final CurrentPersonProvider currentPersonProvider;
    private final ResearchGroupRestMapper mapper;

    @GetMapping
    public List<ResearchGroupResponse> getAllResearchGroups() {
        UUID personId = currentPersonProvider.current().getId();
        log.info("REST GET: list research groups for current person: {}", personId);

        Set<UUID> memberGroupIds = groupMemberRepositoryPort.findAllByPersonId(personId).stream()
                .filter(GroupMember::isActive)
                .map(GroupMember::getResearchGroupId)
                .collect(Collectors.toSet());

        List<ResearchGroup> groups = getAllResearchGroupPort.getAll().stream()
                .filter(group -> memberGroupIds.contains(group.getId()))
                .toList();

        return mapper.toResponseList(groups);
    }

    @GetMapping("/{id}")
    public ResearchGroupResponse getResearchGroupById(@PathVariable UUID id) {
        log.info("REST GET: find research group by ID: {}", id);
        return mapper.toResponse(getResearchGroupPort.get(id));
    }



    @PostMapping
    public ResponseEntity<Void> createResearchGroup(
            @Valid @RequestBody CreateResearchGroupRequest request) {
        UUID id = createResearchGroupPort.create(mapper.toInput(request));
        URI location = URI.create("/api/v1/research-groups/" + id);

                log.info("REST POST: create research group with CNPq ID: {}", request.getCnpqId());


        return ResponseEntity.created(location).build();
    }
    

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateResearchGroup(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateResearchGroupRequest request
    ) {
        log.info("REST PUT: update research group with ID: {}", id);
        updateResearchGroupPort.update(id, mapper.toInput(request));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResearchGroup(@PathVariable UUID id) {
        log.info("REST DELETE: delete research group with ID: {}", id);
        deleteResearchGroupPort.delete(id);
        return ResponseEntity.noContent().build();
    }
}
