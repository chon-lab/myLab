package com.mylab.backend.person.infrastructure.adapters.out.persistence.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "person",
        indexes = {
                @Index(name = "idx_person_research_group", columnList = "research_group_id"),
                @Index(name = "idx_person_name", columnList = "name")
        }
)
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PersonEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "research_group_id", nullable = false, updatable = false)
    private UUID researchGroupId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "social_name", length = 255)
    private String socialName;

    @Column(length = 254)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(length = 11)
    private String cpf;

    @Column(name = "academic_degree", length = 100)
    private String academicDegree;

    @ElementCollection
    @CollectionTable(name = "person_area_of_expertise", joinColumns = @JoinColumn(name = "person_id"))
    @OrderColumn(name = "sort_order")
    @Column(name = "area_of_expertise", nullable = false, length = 500)
    @Builder.Default
    private List<String> areasOfExpertise = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "person_research_line", joinColumns = @JoinColumn(name = "person_id"))
    @Column(name = "research_line_id", nullable = false)
    @Builder.Default
    private Set<UUID> researchLineIds = new HashSet<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
