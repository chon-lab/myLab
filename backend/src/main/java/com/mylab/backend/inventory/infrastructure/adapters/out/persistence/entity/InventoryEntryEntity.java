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
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.mylab.backend.inventory.domain.model.InventoryEntrySource;
import com.mylab.backend.inventory.domain.model.InventoryEntryStatus;

@Entity
@Table(name = "inventory_entry")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InventoryEntryEntity {
    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "research_group_id", nullable = false, updatable = false)
    private UUID researchGroupId;

    @Column(name = "laboratory_id", nullable = false, updatable = false)
    private UUID laboratoryId;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 20)
    private InventoryEntrySource source;

    @Column(name = "source_name", nullable = false, length = 255)
    private String sourceName;

    @Column(name = "received_at", nullable = false)
    private LocalDate receivedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InventoryEntryStatus status;

    @Column(name = "reversed_at")
    private LocalDateTime reversedAt;

    @Column(name = "reversal_reason", columnDefinition = "TEXT")
    private String reversalReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @OneToMany(mappedBy = "inventoryEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InventoryEntryItemEntity> items = new ArrayList<>();
}
