package com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mylab.backend.inventory.domain.model.InventoryTransferStatus;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryTransferEntity;

@Repository
public interface InventoryTransferJpaRepository extends JpaRepository<InventoryTransferEntity, UUID> {

    @Query("""
            SELECT line.inventoryItemId AS inventoryItemId,
                   SUM(line.quantity) AS quantity,
                   SUM(line.quantity * line.unitCost) AS totalValue
            FROM InventoryTransferEntity transfer
            JOIN transfer.items line
            WHERE transfer.researchGroupId = :researchGroupId
              AND transfer.status = :status
              AND transfer.sourceLaboratoryId = :laboratoryId
            GROUP BY line.inventoryItemId
            """)
    List<InventoryTransferStockProjection> findOutwardTransferTotals(
            @Param("researchGroupId") UUID researchGroupId,
            @Param("laboratoryId") UUID laboratoryId,
            @Param("status") InventoryTransferStatus status
    );

    @Query("""
            SELECT line.inventoryItemId AS inventoryItemId,
                   SUM(line.quantity) AS quantity,
                   SUM(line.quantity * line.unitCost) AS totalValue
            FROM InventoryTransferEntity transfer
            JOIN transfer.items line
            WHERE transfer.researchGroupId = :researchGroupId
              AND transfer.status = :status
              AND transfer.destinationLaboratoryId = :laboratoryId
            GROUP BY line.inventoryItemId
            """)
    List<InventoryTransferStockProjection> findInwardTransferTotals(
            @Param("researchGroupId") UUID researchGroupId,
            @Param("laboratoryId") UUID laboratoryId,
            @Param("status") InventoryTransferStatus status
    );

    @Query("""
            SELECT DISTINCT transfer
            FROM InventoryTransferEntity transfer
            JOIN FETCH transfer.items line
            JOIN FETCH line.inventoryItem
            JOIN FETCH transfer.sourceLaboratory
            JOIN FETCH transfer.destinationLaboratory
            WHERE transfer.researchGroupId = :researchGroupId
              AND (:sourceLaboratoryId IS NULL OR transfer.sourceLaboratoryId = :sourceLaboratoryId)
              AND (:destinationLaboratoryId IS NULL OR transfer.destinationLaboratoryId = :destinationLaboratoryId)
              AND (:inventoryItemId IS NULL OR EXISTS (
                    SELECT matchingLine.id
                    FROM InventoryTransferItemEntity matchingLine
                    WHERE matchingLine.inventoryTransfer = transfer
                      AND matchingLine.inventoryItemId = :inventoryItemId
              ))
              AND (:dateFrom IS NULL OR transfer.transferredAt >= :dateFrom)
              AND (:dateTo IS NULL OR transfer.transferredAt <= :dateTo)
            ORDER BY transfer.transferredAt DESC, transfer.createdAt DESC
            """)
    List<InventoryTransferEntity> searchHistory(
            @Param("researchGroupId") UUID researchGroupId,
            @Param("sourceLaboratoryId") UUID sourceLaboratoryId,
            @Param("destinationLaboratoryId") UUID destinationLaboratoryId,
            @Param("inventoryItemId") UUID inventoryItemId,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo
    );

    @Query("""
            SELECT DISTINCT transfer
            FROM InventoryTransferEntity transfer
            LEFT JOIN FETCH transfer.items line
            LEFT JOIN FETCH line.inventoryItem
            LEFT JOIN FETCH transfer.sourceLaboratory
            LEFT JOIN FETCH transfer.destinationLaboratory
            WHERE transfer.id = :id
            """)
    Optional<InventoryTransferEntity> findByIdWithDetails(@Param("id") UUID id);
}

