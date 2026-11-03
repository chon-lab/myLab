package com.mylab.backend.groupmember.infrastructure.adapters.in.rest;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mylab.backend.auth.infrastructure.CurrentPersonProvider;
import com.mylab.backend.groupmember.application.port.in.ManageMembershipPort;
import com.mylab.backend.groupmember.infrastructure.adapters.in.rest.dto.InvitationResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
public class MyMembershipController {

    private final ManageMembershipPort manageMembershipPort;
    private final CurrentPersonProvider currentPersonProvider;

    @GetMapping("/api/v1/me/invitations")
    public List<InvitationResponse> getMyInvitations() {
        UUID personId = currentPersonProvider.current().getId();
        log.info("REST GET: list pending invitations for current user");
        return manageMembershipPort.getPendingInvitations(personId).stream()
                .map(view -> new InvitationResponse(
                        view.membershipId(),
                        view.researchGroupId(),
                        view.researchGroupName(),
                        view.roleId(),
                        view.roleName()
                ))
                .toList();
    }

    @PostMapping("/api/v1/me/invitations/{membershipId}/accept")
    public ResponseEntity<Void> acceptInvitation(@PathVariable UUID membershipId) {
        UUID personId = currentPersonProvider.current().getId();
        log.info("REST POST: accept invitation {}", membershipId);
        manageMembershipPort.acceptInvitation(personId, membershipId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/v1/me/invitations/{membershipId}/reject")
    public ResponseEntity<Void> rejectInvitation(@PathVariable UUID membershipId) {
        UUID personId = currentPersonProvider.current().getId();
        log.info("REST POST: reject invitation {}", membershipId);
        manageMembershipPort.rejectInvitation(personId, membershipId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/v1/me/research-groups/{researchGroupId}/leave")
    public ResponseEntity<Void> leaveResearchGroup(@PathVariable UUID researchGroupId) {
        UUID personId = currentPersonProvider.current().getId();
        log.info("REST POST: leave research group {}", researchGroupId);
        manageMembershipPort.leaveResearchGroup(personId, researchGroupId);
        return ResponseEntity.noContent().build();
    }
}
