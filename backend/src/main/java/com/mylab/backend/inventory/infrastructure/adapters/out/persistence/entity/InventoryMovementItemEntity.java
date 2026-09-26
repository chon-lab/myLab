package com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inventory_movement_item")
@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
public class InventoryMovementItemEntity {
    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "inventory_movement_id", nullable = false, updatable = false)
    private InventoryMovementEntity movement;
    @Column(name = "inventory_item_id", nullable = false, updatable = false)
    private UUID inventoryItemId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_item_id", insertable = false, updatable = false)
    private InventoryItemEntity inventoryItem;
    @Column(nullable = false, precision = 15, scale = 4, updatable = false)
    private BigDecimal quantity;
    @Column(name = "unit_cost", nullable = false, precision = 15, scale = 2, updatable = false)
    private BigDecimal unitCost;
    @Column(name = "batch_number", updatable = false)
    private String batchNumber;
    @Column(updatable = false)
    private String manufacturer;
    @Column(name = "expiration_date", updatable = false)
    private LocalDate expirationDate;
}
