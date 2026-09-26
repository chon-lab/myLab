package com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;
import com.mylab.backend.inventory.domain.model.*;
import com.mylab.backend.laboratory.infrastructure.adapters.out.persistence.entity.LaboratoryEntity;

@Entity
@Table(name = "inventory_movement")
@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
public class InventoryMovementEntity {
    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;
    @Column(name = "research_group_id", nullable = false, updatable = false)
    private UUID researchGroupId;
    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false, updatable = false)
    private InventoryMovementType type;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, updatable = false)
    private InventoryMovementReason reason;
    @Column(name = "source_laboratory_id", updatable = false)
    private UUID sourceLaboratoryId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_laboratory_id", insertable = false, updatable = false)
    private LaboratoryEntity sourceLaboratory;
    @Column(name = "destination_laboratory_id", updatable = false)
    private UUID destinationLaboratoryId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_laboratory_id", insertable = false, updatable = false)
    private LaboratoryEntity destinationLaboratory;
    @Column(name = "external_source_name", updatable = false)
    private String externalSourceName;
    @Column(name = "occurred_at", nullable = false, updatable = false)
    private LocalDate occurredAt;
    @Column(columnDefinition = "TEXT", updatable = false)
    private String notes;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InventoryMovementStatus status;
    @Column(name = "reversed_at")
    private LocalDateTime reversedAt;
    @Column(name = "reversal_reason", columnDefinition = "TEXT")
    private String reversalReason;
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @Builder.Default
    @OneToMany(mappedBy = "movement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InventoryMovementItemEntity> items = new ArrayList<>();
}
