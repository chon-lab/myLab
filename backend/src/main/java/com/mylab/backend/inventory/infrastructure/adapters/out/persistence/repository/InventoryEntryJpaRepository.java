package com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mylab.backend.inventory.domain.model.InventoryEntrySource;
import com.mylab.backend.inventory.domain.model.InventoryEntryStatus;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryEntryEntity;

@Repository
public interface InventoryEntryJpaRepository extends JpaRepository<InventoryEntryEntity, UUID> {

    @Query("""
            SELECT item.id AS inventoryItemId,
                   item.name AS itemName,
                   item.itemType AS itemType,
                   item.unitOfMeasure AS unitOfMeasure,
                   SUM(line.quantity) AS quantity,
                   SUM(line.quantity * line.historicalUnitValue) AS totalValue
            FROM InventoryEntryEntity entry
            JOIN entry.items line
            JOIN line.inventoryItem item
            WHERE entry.researchGroupId = :researchGroupId
              AND entry.status = :status
              AND (:laboratoryId IS NULL OR entry.laboratoryId = :laboratoryId)
            GROUP BY item.id, item.name, item.itemType, item.unitOfMeasure
            ORDER BY item.name
            """)
    List<InventoryStockProjection> findStock(
            @Param("researchGroupId") UUID researchGroupId,
            @Param("laboratoryId") UUID laboratoryId,
            @Param("status") InventoryEntryStatus status
    );

    @Query("""
            SELECT DISTINCT entry
            FROM InventoryEntryEntity entry
            JOIN FETCH entry.items line
            JOIN FETCH line.inventoryItem
            JOIN FETCH entry.laboratory
            WHERE entry.researchGroupId = :researchGroupId
              AND (:laboratoryId IS NULL OR entry.laboratoryId = :laboratoryId)
              AND (:source IS NULL OR entry.source = :source)
              AND (:inventoryItemId IS NULL OR EXISTS (
                    SELECT matchingLine.id
                    FROM InventoryEntryItemEntity matchingLine
                    WHERE matchingLine.inventoryEntry = entry
                      AND matchingLine.inventoryItemId = :inventoryItemId
              ))
              AND (:dateFrom IS NULL OR entry.receivedAt >= :dateFrom)
              AND (:dateTo IS NULL OR entry.receivedAt <= :dateTo)
            ORDER BY entry.receivedAt DESC, entry.createdAt DESC
            """)
    List<InventoryEntryEntity> searchHistory(
            @Param("researchGroupId") UUID researchGroupId,
            @Param("laboratoryId") UUID laboratoryId,
            @Param("source") InventoryEntrySource source,
            @Param("inventoryItemId") UUID inventoryItemId,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo
    );
}
