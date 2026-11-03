package com.mylab.backend.person.infrastructure.adapters.in.rest;

import com.mylab.backend.auth.infrastructure.web.RequiredPermission;
import com.mylab.backend.role.domain.model.PermissionResource;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mylab.backend.person.application.dto.AssignablePersonView;
import com.mylab.backend.person.application.port.in.DeletePersonPort;
import com.mylab.backend.person.application.port.in.GetAllPersonPort;
import com.mylab.backend.person.application.port.in.GetAssignablePeoplePort;
import com.mylab.backend.person.application.port.in.GetPersonPort;
import com.mylab.backend.person.application.port.in.UpdatePersonPort;
import com.mylab.backend.person.infrastructure.adapters.in.rest.dto.AssignablePersonResponse;
import com.mylab.backend.person.infrastructure.adapters.in.rest.dto.PersonResponse;
import com.mylab.backend.person.infrastructure.adapters.in.rest.dto.UpdatePersonRequest;
import com.mylab.backend.person.infrastructure.adapters.in.rest.mapper.PersonRestMapper;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredPermission(resource = PermissionResource.MEMBER)
@RequiredArgsConstructor
@Slf4j
public class PersonController {

    private final UpdatePersonPort updatePersonPort;
    private final DeletePersonPort deletePersonPort;
    private final GetPersonPort getPersonPort;
    private final GetAllPersonPort getAllPersonPort;
    private final GetAssignablePeoplePort getAssignablePeoplePort;
    private final PersonRestMapper mapper;

    @GetMapping("/api/v1/research-groups/{researchGroupId}/people")
    public List<PersonResponse> getAllPeopleByGroup(@PathVariable UUID researchGroupId) {
        log.info("REST GET: list people for research group: {}", researchGroupId);
        return mapper.toResponseList(getAllPersonPort.getAllByResearchGroup(researchGroupId));
    }

    @GetMapping("/api/v1/research-groups/{researchGroupId}/assignable-people")
    public List<AssignablePersonResponse> getAssignablePeople(
            @PathVariable UUID researchGroupId,
            @RequestParam(name = "search", required = false) String search) {
        log.info("REST GET: list assignable people for research group: {}", researchGroupId);
        return getAssignablePeoplePort.getAssignable(researchGroupId, search).stream()
                .map(this::toResponse)
                .toList();
    }

    private AssignablePersonResponse toResponse(AssignablePersonView view) {
        return new AssignablePersonResponse(view.id(), view.name(), view.email(), view.academicDegree());
    }

    @GetMapping("/api/v1/people/{id}")
    public PersonResponse getPersonById(@PathVariable UUID id) {
        log.info("REST GET: find person by ID: {}", id);
        return mapper.toResponse(getPersonPort.get(id));
    }

    @PutMapping("/api/v1/people/{id}")
    public ResponseEntity<Void> updatePerson(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePersonRequest request
    ) {
        log.info("REST PUT: update person with ID: {}", id);
        updatePersonPort.update(id, mapper.toInput(request));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/v1/people/{id}")
    public ResponseEntity<Void> deletePerson(@PathVariable UUID id) {
        log.info("REST DELETE: delete person with ID: {}", id);
        deletePersonPort.delete(id);
        return ResponseEntity.noContent().build();
    }
}
