package com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mylab.backend.inventory.domain.model.InventoryExitStatus;
import com.mylab.backend.inventory.domain.model.InventoryExitType;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryExitEntity;

@Repository
public interface InventoryExitJpaRepository extends JpaRepository<InventoryExitEntity, UUID> {

    @Query("""
            SELECT line.inventoryItemId AS inventoryItemId,
                   SUM(line.quantity) AS quantity,
                   SUM(line.quantity * line.unitCost) AS totalValue
            FROM InventoryExitEntity exit
            JOIN exit.items line
            WHERE exit.researchGroupId = :researchGroupId
              AND exit.status = :status
              AND (:laboratoryId IS NULL OR exit.laboratoryId = :laboratoryId)
            GROUP BY line.inventoryItemId
            """)
    List<InventoryExitStockProjection> findExitTotals(
            @Param("researchGroupId") UUID researchGroupId,
            @Param("laboratoryId") UUID laboratoryId,
            @Param("status") InventoryExitStatus status
    );

    @Query("""
            SELECT DISTINCT exit
            FROM InventoryExitEntity exit
            JOIN FETCH exit.items line
            JOIN FETCH line.inventoryItem
            JOIN FETCH exit.laboratory
            WHERE exit.researchGroupId = :researchGroupId
              AND (:laboratoryId IS NULL OR exit.laboratoryId = :laboratoryId)
              AND (:type IS NULL OR exit.type = :type)
              AND (:inventoryItemId IS NULL OR EXISTS (
                    SELECT matchingLine.id
                    FROM InventoryExitItemEntity matchingLine
                    WHERE matchingLine.inventoryExit = exit
                      AND matchingLine.inventoryItemId = :inventoryItemId
              ))
              AND (:dateFrom IS NULL OR exit.occurredAt >= :dateFrom)
              AND (:dateTo IS NULL OR exit.occurredAt <= :dateTo)
            ORDER BY exit.occurredAt DESC, exit.createdAt DESC
            """)
    List<InventoryExitEntity> searchHistory(
            @Param("researchGroupId") UUID researchGroupId,
            @Param("laboratoryId") UUID laboratoryId,
            @Param("type") InventoryExitType type,
            @Param("inventoryItemId") UUID inventoryItemId,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo
    );

    @Query("""
            SELECT DISTINCT exit
            FROM InventoryExitEntity exit
            LEFT JOIN FETCH exit.items line
            LEFT JOIN FETCH line.inventoryItem
            LEFT JOIN FETCH exit.laboratory
            WHERE exit.id = :id
            """)
    Optional<InventoryExitEntity> findByIdWithDetails(@Param("id") UUID id);
}

