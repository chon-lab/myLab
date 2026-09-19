package com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryEntryEntity;

@Repository
public interface InventoryEntryJpaRepository extends JpaRepository<InventoryEntryEntity, UUID> {
}
