package com.mylab.backend.groupmember.infrastructure.adapters.out.persistence.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import com.mylab.backend.groupmember.domain.model.GroupMemberRole;
import com.mylab.backend.groupmember.domain.model.MembershipStatus;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
                @Index(name = "idx_group_member_group_status", columnList = "research_group_id, status"),
                @Index(name = "idx_group_member_person_status", columnList = "person_id, status")
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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private MembershipStatus status;

    @Enumerated(EnumType.STRING)
    @Column(length = 32)
    private GroupMemberRole role;

    @Column(name = "role_id")
    private UUID roleId;

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
