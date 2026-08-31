package com.mylab.backend.researchline.infrastructure.adapters.out.persistence.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "research_line",
        indexes = {
                @Index(name = "idx_research_line_research_group", columnList = "research_group_id"),
                @Index(name = "idx_research_line_name", columnList = "name")
        }
)
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResearchLineEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "research_group_id", nullable = false, updatable = false)
    private UUID researchGroupId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String objective;

    @ElementCollection
    @CollectionTable(name = "research_line_keyword", joinColumns = @JoinColumn(name = "research_line_id"))
    @OrderColumn(name = "sort_order")
    @Column(name = "keyword", nullable = false, length = 255)
    @Builder.Default
    private List<String> keywords = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "research_line_knowledge_area", joinColumns = @JoinColumn(name = "research_line_id"))
    @OrderColumn(name = "sort_order")
    @Column(name = "knowledge_area", nullable = false, length = 500)
    @Builder.Default
    private List<String> knowledgeAreas = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "research_line_application_sector", joinColumns = @JoinColumn(name = "research_line_id"))
    @OrderColumn(name = "sort_order")
    @Column(name = "application_sector", nullable = false, length = 255)
    @Builder.Default
    private List<String> applicationSectors = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
