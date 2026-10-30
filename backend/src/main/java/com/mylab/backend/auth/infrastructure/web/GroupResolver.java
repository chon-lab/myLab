package com.mylab.backend.auth.infrastructure.web;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.mylab.backend.groupmember.infrastructure.adapters.out.persistence.entity.GroupMemberEntity;
import com.mylab.backend.groupmember.infrastructure.adapters.out.persistence.repository.GroupMemberJpaRepository;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryItemEntity;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryMovementEntity;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryItemJpaRepository;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository.InventoryMovementJpaRepository;
import com.mylab.backend.laboratory.infrastructure.adapters.out.persistence.entity.LaboratoryEntity;
import com.mylab.backend.laboratory.infrastructure.adapters.out.persistence.repository.LaboratoryJpaRepository;
import com.mylab.backend.project.infrastructure.adapters.out.persistence.entity.ProjectEntity;
import com.mylab.backend.project.infrastructure.adapters.out.persistence.repository.ProjectJpaRepository;
import com.mylab.backend.researchline.infrastructure.adapters.out.persistence.entity.ResearchLineEntity;
import com.mylab.backend.researchline.infrastructure.adapters.out.persistence.repository.ResearchLineJpaRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class GroupResolver {

    private final ResearchLineJpaRepository researchLineRepository;
    private final GroupMemberJpaRepository groupMemberRepository;
    private final LaboratoryJpaRepository laboratoryRepository;
    private final ProjectJpaRepository projectRepository;
    private final InventoryItemJpaRepository inventoryItemRepository;
    private final InventoryMovementJpaRepository inventoryMovementRepository;

    public Optional<UUID> byResearchLine(UUID id) {
        return researchLineRepository.findById(id).map(ResearchLineEntity::getResearchGroupId);
    }

    public Optional<UUID> byMember(UUID id) {
        return groupMemberRepository.findById(id).map(GroupMemberEntity::getResearchGroupId);
    }

    public Optional<UUID> byLaboratory(UUID id) {
        return laboratoryRepository.findById(id).map(LaboratoryEntity::getResearchGroupId);
    }

    public Optional<UUID> byProject(UUID id) {
        return projectRepository.findById(id)
                .map(ProjectEntity::getLaboratoryId)
                .flatMap(this::byLaboratory);
    }

    public Optional<UUID> byInventoryItem(UUID id) {
        return inventoryItemRepository.findById(id).map(InventoryItemEntity::getResearchGroupId);
    }

    public Optional<UUID> byMovement(UUID id) {
        return inventoryMovementRepository.findById(id).map(InventoryMovementEntity::getResearchGroupId);
    }
}
