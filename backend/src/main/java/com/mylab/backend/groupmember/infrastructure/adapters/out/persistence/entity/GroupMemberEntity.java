package com.mylab.backend.groupmember.infrastructure.adapters.out.persistence.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "group_member",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_group_member_person_research_group",
                columnNames = {"person_id", "research_group_id"}
        ),
        indexes = {
                @Index(name = "idx_group_member_group_active", columnList = "research_group_id, active"),
                @Index(name = "idx_group_member_person_active", columnList = "person_id, active")
        }
)
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GroupMemberEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "person_id", nullable = false, updatable = false)
    private UUID personId;

    @Column(name = "research_group_id", nullable = false, updatable = false)
    private UUID researchGroupId;

    @Column(nullable = false)
    private boolean active;

    @ElementCollection
    @CollectionTable(
            name = "group_member_research_line",
            joinColumns = @JoinColumn(name = "group_member_id")
    )
    @Column(name = "research_line_id", nullable = false)
    @Builder.Default
    private Set<UUID> researchLineIds = new HashSet<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
