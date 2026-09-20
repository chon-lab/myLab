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
import com.mylab.backend.inventory.domain.model.InventoryTransferStatus;
import com.mylab.backend.laboratory.infrastructure.adapters.out.persistence.entity.LaboratoryEntity;

@Entity
@Table(name = "inventory_transfer")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InventoryTransferEntity {
    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "research_group_id", nullable = false, updatable = false)
    private UUID researchGroupId;

    @Column(name = "source_laboratory_id", nullable = false, updatable = false)
    private UUID sourceLaboratoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_laboratory_id", insertable = false, updatable = false)
    private LaboratoryEntity sourceLaboratory;

    @Column(name = "destination_laboratory_id", nullable = false, updatable = false)
    private UUID destinationLaboratoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_laboratory_id", insertable = false, updatable = false)
    private LaboratoryEntity destinationLaboratory;

    @Column(name = "transferred_at", nullable = false)
    private LocalDate transferredAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InventoryTransferStatus status;

    @Column(name = "reversed_at")
    private LocalDateTime reversedAt;

    @Column(name = "reversal_reason", columnDefinition = "TEXT")
    private String reversalReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @OneToMany(mappedBy = "inventoryTransfer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InventoryTransferItemEntity> items = new ArrayList<>();
}

