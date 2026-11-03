package com.mylab.backend.groupmember.domain.model;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import com.mylab.backend.groupmember.domain.exception.InvalidGroupMemberException;

import lombok.Builder;
import lombok.Getter;

@Getter
public class GroupMember {

    private final UUID id;
    private final UUID personId;
    private final UUID researchGroupId;
    private MembershipStatus status;
    private GroupMemberRole role;
    private UUID roleId;
    private Set<UUID> researchLineIds;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder
    public GroupMember(
            UUID id,
            UUID personId,
            UUID researchGroupId,
            MembershipStatus status,
            GroupMemberRole role,
            UUID roleId,
            Set<UUID> researchLineIds,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = requireNonNull(id, "id");
        this.personId = requireNonNull(personId, "personId");
        this.researchGroupId = requireNonNull(researchGroupId, "researchGroupId");
        this.status = requireNonNull(status, "status");
        this.role = role;
        this.roleId = roleId;
        this.researchLineIds = defaultIfNull(researchLineIds);
        this.createdAt = requireNonNull(createdAt, "createdAt");
        this.updatedAt = requireValidUpdatedAt(updatedAt, createdAt);
    }

    public boolean isActive() {
        return status == MembershipStatus.ACTIVE;
    }

    public boolean isPending() {
        return status == MembershipStatus.PENDING;
    }

    public void assignRole(UUID roleId, LocalDateTime occurredAt) {
        this.roleId = requireNonNull(roleId, "roleId");
        this.updatedAt = advance(occurredAt);
    }

    public void invite(UUID roleId, Set<UUID> researchLineIds, LocalDateTime occurredAt) {
        this.status = MembershipStatus.PENDING;
        this.roleId = requireNonNull(roleId, "roleId");
        this.researchLineIds = defaultIfNull(researchLineIds);
        this.updatedAt = advance(occurredAt);
    }

    public void accept(LocalDateTime occurredAt) {
        if (status != MembershipStatus.PENDING) {
            throw new InvalidGroupMemberException("only a pending invitation can be accepted");
        }
        this.status = MembershipStatus.ACTIVE;
        this.updatedAt = advance(occurredAt);
    }

    public void reject(LocalDateTime occurredAt) {
        if (status != MembershipStatus.PENDING) {
            throw new InvalidGroupMemberException("only a pending invitation can be rejected");
        }
        this.status = MembershipStatus.INACTIVE;
        this.updatedAt = advance(occurredAt);
    }

    public void leave(LocalDateTime occurredAt) {
        if (status != MembershipStatus.ACTIVE) {
            throw new InvalidGroupMemberException("only an active membership can be left");
        }
        this.status = MembershipStatus.INACTIVE;
        this.updatedAt = advance(occurredAt);
    }

    public void updateResearchLines(Set<UUID> researchLineIds, LocalDateTime occurredAt) {
        this.researchLineIds = defaultIfNull(researchLineIds);
        this.updatedAt = advance(occurredAt);
    }

    public void update(MembershipStatus status, GroupMemberRole role, Set<UUID> researchLineIds, LocalDateTime occurredAt) {
        this.status = requireNonNull(status, "status");
        this.role = role;
        this.researchLineIds = defaultIfNull(researchLineIds);
        this.updatedAt = advance(occurredAt);
    }

    private LocalDateTime advance(LocalDateTime occurredAt) {
        LocalDateTime validUpdatedAt = requireValidUpdatedAt(occurredAt, this.createdAt);
        if (validUpdatedAt.isBefore(this.updatedAt)) {
            throw new InvalidGroupMemberException("updatedAt must not move backwards");
        }
        return validUpdatedAt;
    }

    private static <T> T requireNonNull(T value, String fieldName) {
        if (value == null) {
            throw new InvalidGroupMemberException(fieldName + " must not be null");
        }
        return value;
    }

    private static Set<UUID> defaultIfNull(Set<UUID> values) {
        return values == null ? Set.of() : Set.copyOf(values);
    }

    private static LocalDateTime requireValidUpdatedAt(LocalDateTime updatedAt, LocalDateTime createdAt) {
        requireNonNull(updatedAt, "updatedAt");
        if (updatedAt.isBefore(createdAt)) {
            throw new InvalidGroupMemberException("updatedAt must not be before createdAt");
        }
        return updatedAt;
    }
}
