package com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryItemEntity;

@Repository
public interface InventoryItemJpaRepository extends JpaRepository<InventoryItemEntity, UUID> {

    Optional<InventoryItemEntity> findByIdAndDeletedAtIsNull(UUID id);

    List<InventoryItemEntity> findAllByResearchGroupIdAndDeletedAtIsNullOrderByName(UUID researchGroupId);
}
