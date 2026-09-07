package com.mylab.backend.laboratory.infrastructure.adapters.out.persistence.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.mylab.backend.laboratory.domain.model.LaboratoryStatus;

@Entity
@Table(
        name = "laboratory",
        indexes = @Index(name = "idx_laboratory_research_group_active", columnList = "research_group_id, deleted_at")
)
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LaboratoryEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "research_group_id", nullable = false, updatable = false)
    private UUID researchGroupId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private LaboratoryStatus status;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "street", column = @Column(name = "address_street", length = 255)),
            @AttributeOverride(name = "number", column = @Column(name = "address_number", length = 30)),
            @AttributeOverride(name = "city", column = @Column(name = "address_city", length = 120)),
            @AttributeOverride(name = "postalCode", column = @Column(name = "address_postal_code", length = 8))
    })
    private LaboratoryAddressEmbeddable address;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
