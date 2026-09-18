package com.mylab.backend.inventory.infrastructure.adapters.out.persistence.mapper;

import org.springframework.stereotype.Component;
import com.mylab.backend.inventory.domain.model.InventoryItem;
import com.mylab.backend.inventory.infrastructure.adapters.out.persistence.entity.InventoryItemEntity;

@Component
public class InventoryItemMapper {
    public InventoryItemEntity toEntity(InventoryItem domain) {
        return InventoryItemEntity.builder()
                .id(domain.getId())
                .researchGroupId(domain.getResearchGroupId())
                .name(domain.getName())
                .description(domain.getDescription())
                .itemType(domain.getItemType())
                .unitOfMeasure(domain.getUnitOfMeasure())
                .referenceUnitValue(domain.getReferenceUnitValue())
                .active(domain.isActive())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .deletedAt(domain.getDeletedAt())
                .build();
    }

    public InventoryItem toDomain(InventoryItemEntity entity) {
        return InventoryItem.builder()
                .id(entity.getId())
                .researchGroupId(entity.getResearchGroupId())
                .name(entity.getName())
                .description(entity.getDescription())
                .itemType(entity.getItemType())
                .unitOfMeasure(entity.getUnitOfMeasure())
                .referenceUnitValue(entity.getReferenceUnitValue())
                .active(entity.isActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .deletedAt(entity.getDeletedAt())
                .build();
    }
}
