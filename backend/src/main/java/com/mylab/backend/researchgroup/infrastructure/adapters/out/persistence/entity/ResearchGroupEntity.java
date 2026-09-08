package com.mylab.backend.researchgroup.infrastructure.adapters.out.persistence.entity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import com.mylab.backend.common.infrastructure.adapters.out.persistence.entity.AddressEntity;
import com.mylab.backend.common.infrastructure.adapters.out.persistence.entity.ContactEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "research_group",
        uniqueConstraints = @UniqueConstraint(name = "uk_research_group_cnpq_id", columnNames = "cnpq_id"),
        indexes = @Index(name = "idx_research_group_name", columnList = "name")
)
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResearchGroupEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "cnpq_id", nullable = false, unique = true, length = 64)
    private String cnpqId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 50)
    private String situation;

    @Column(name = "formation_year", nullable = false)
    private int formationYear;

    @Column(name = "situation_at")
    private LocalDateTime situationAt;

    @Column(name = "last_submitted_at")
    private LocalDateTime lastSubmittedAt;

    @Column(name = "predominant_area", nullable = false, length = 500)
    private String predominantArea;

    @Column(name = "institution_name", nullable = false, length = 255)
    private String institutionName;

    @Column(name = "institution_unit", length = 255)
    private String institutionUnit;

    @Column(name = "source_url", length = 2048)
    private String sourceUrl;

    @Column(columnDefinition = "TEXT")
    private String repercussions;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "address_id", unique = true)
    private AddressEntity address;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "research_group_id")
    private List<ContactEntity> contacts;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
