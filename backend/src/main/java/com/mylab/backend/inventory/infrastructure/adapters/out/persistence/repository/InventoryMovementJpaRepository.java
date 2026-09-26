package com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryMovementEntity;

public interface InventoryMovementJpaRepository extends JpaRepository<InventoryMovementEntity, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT movement FROM InventoryMovementEntity movement WHERE movement.id = :id")
    Optional<InventoryMovementEntity> lockById(@Param("id") UUID id);

    @Query("""
            SELECT DISTINCT movement FROM InventoryMovementEntity movement
            JOIN FETCH movement.items line
            JOIN FETCH line.inventoryItem
            LEFT JOIN FETCH movement.sourceLaboratory
            LEFT JOIN FETCH movement.destinationLaboratory
            WHERE movement.researchGroupId = :groupId
            ORDER BY movement.occurredAt DESC, movement.createdAt DESC
            """)
    List<InventoryMovementEntity> findGroupWithDetails(@Param("groupId") UUID groupId);

    @Query("""
            SELECT DISTINCT movement FROM InventoryMovementEntity movement
            JOIN FETCH movement.items line
            JOIN FETCH line.inventoryItem
            LEFT JOIN FETCH movement.sourceLaboratory
            LEFT JOIN FETCH movement.destinationLaboratory
            WHERE movement.id = :id
            """)
    Optional<InventoryMovementEntity> findByIdWithDetails(@Param("id") UUID id);
}
