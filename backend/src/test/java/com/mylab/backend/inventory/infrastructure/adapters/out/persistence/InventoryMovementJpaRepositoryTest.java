package com.mylab.backend.inventory.infrastructure.adapters.out.persistence;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryMovementJpaRepository;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional(readOnly = true)
class InventoryMovementJpaRepositoryTest {
    @Autowired private InventoryMovementJpaRepository repository;

    @Test
    void unifiedHistoryQueriesExecuteAgainstMigratedSchema() {
        UUID absentId = UUID.randomUUID();
        assertThat(repository.findGroupWithDetails(absentId)).isEmpty();
        assertThat(repository.findByIdWithDetails(absentId)).isEmpty();
    }
}
