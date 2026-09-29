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
    private boolean active;
    private Set<UUID> researchLineIds;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder
    public GroupMember(
            UUID id,
            UUID personId,
            UUID researchGroupId,
            boolean active,
            Set<UUID> researchLineIds,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = requireNonNull(id, "id");
        this.personId = requireNonNull(personId, "personId");
        this.researchGroupId = requireNonNull(researchGroupId, "researchGroupId");
        this.active = active;
        this.researchLineIds = defaultIfNull(researchLineIds);
        this.createdAt = requireNonNull(createdAt, "createdAt");
        this.updatedAt = requireValidUpdatedAt(updatedAt, createdAt);
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

    public void activate(LocalDateTime occurredAt) {
        LocalDateTime validUpdatedAt = requireValidUpdatedAt(occurredAt, this.createdAt);
        if (validUpdatedAt.isBefore(this.updatedAt)) {
            throw new InvalidGroupMemberException("updatedAt must not move backwards");
        }
        this.active = true;
        this.updatedAt = validUpdatedAt;
    }

    public void deactivate(LocalDateTime occurredAt) {
        LocalDateTime validUpdatedAt = requireValidUpdatedAt(occurredAt, this.createdAt);
        if (validUpdatedAt.isBefore(this.updatedAt)) {
            throw new InvalidGroupMemberException("updatedAt must not move backwards");
        }
        this.active = false;
        this.updatedAt = validUpdatedAt;
    }

    public void updateResearchLines(Set<UUID> researchLineIds, LocalDateTime occurredAt) {
        LocalDateTime validUpdatedAt = requireValidUpdatedAt(occurredAt, this.createdAt);
        if (validUpdatedAt.isBefore(this.updatedAt)) {
            throw new InvalidGroupMemberException("updatedAt must not move backwards");
        }
        this.researchLineIds = defaultIfNull(researchLineIds);
        this.updatedAt = validUpdatedAt;
    }

    public void update(boolean active, Set<UUID> researchLineIds, LocalDateTime occurredAt) {
        LocalDateTime validUpdatedAt = requireValidUpdatedAt(occurredAt, this.createdAt);
        if (validUpdatedAt.isBefore(this.updatedAt)) {
            throw new InvalidGroupMemberException("updatedAt must not move backwards");
        }
        this.active = active;
        this.researchLineIds = defaultIfNull(researchLineIds);
        this.updatedAt = validUpdatedAt;
    }
}
