package com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.mylab.backend.inventory.domain.model.InventoryExitStatus;
import com.mylab.backend.inventory.domain.model.InventoryExitType;
import com.mylab.backend.laboratory.infrastructure.adapters.out.persistence.entity.LaboratoryEntity;

@Entity
@Table(name = "inventory_exit")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InventoryExitEntity {
    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "research_group_id", nullable = false, updatable = false)
    private UUID researchGroupId;

    @Column(name = "laboratory_id", nullable = false, updatable = false)
    private UUID laboratoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "laboratory_id", insertable = false, updatable = false)
    private LaboratoryEntity laboratory;

    @Enumerated(EnumType.STRING)
    @Column(name = "exit_type", nullable = false, length = 20)
    private InventoryExitType type;

    @Column(name = "occurred_at", nullable = false)
    private LocalDate occurredAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InventoryExitStatus status;

    @Column(name = "reversed_at")
    private LocalDateTime reversedAt;

    @Column(name = "reversal_reason", columnDefinition = "TEXT")
    private String reversalReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @OneToMany(mappedBy = "inventoryExit", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InventoryExitItemEntity> items = new ArrayList<>();
}

