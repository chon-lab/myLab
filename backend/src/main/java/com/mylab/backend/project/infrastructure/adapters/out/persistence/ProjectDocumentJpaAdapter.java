package com.mylab.backend.project.infrastructure.adapters.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.mylab.backend.project.application.port.out.ProjectDocumentRepositoryPort;
import com.mylab.backend.project.domain.model.ProjectDocument;
import com.mylab.backend.project.infrastructure.adapters.out.persistence.mapper.ProjectDocumentMapper;
import com.mylab.backend.project.infrastructure.adapters.out.persistence.repository.ProjectDocumentJpaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProjectDocumentJpaAdapter implements ProjectDocumentRepositoryPort {

    private final ProjectDocumentJpaRepository jpaRepository;
    private final ProjectDocumentMapper mapper;

    @Override
    public void save(ProjectDocument document) {
        log.debug("Saving project document with ID: {}", document.getId());
        jpaRepository.save(mapper.toEntity(document));
    }

    @Override
    public Optional<ProjectDocument> findByIdAndProjectId(UUID id, UUID projectId) {
        return jpaRepository.findByIdAndProjectId(id, projectId).map(mapper::toDomain);
    }

    @Override
    public List<ProjectDocument> findAllByProjectId(UUID projectId) {
        return mapper.toDomainList(jpaRepository.findAllByProjectIdOrderByUploadedAtAsc(projectId));
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }
}
