package com.mylab.backend.project.infrastructure.adapters.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.mylab.backend.project.application.port.out.ProjectRepositoryPort;
import com.mylab.backend.project.domain.model.Project;
import com.mylab.backend.project.domain.model.ProjectDocument;
import com.mylab.backend.project.infrastructure.adapters.out.persistence.mapper.ProjectDocumentMapper;
import com.mylab.backend.project.infrastructure.adapters.out.persistence.mapper.ProjectMapper;
import com.mylab.backend.project.infrastructure.adapters.out.persistence.repository.ProjectDocumentJpaRepository;
import com.mylab.backend.project.infrastructure.adapters.out.persistence.repository.ProjectJpaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProjectJpaAdapter implements ProjectRepositoryPort {

    private final ProjectJpaRepository jpaRepository;
    private final ProjectDocumentJpaRepository documentJpaRepository;
    private final ProjectMapper mapper;
    private final ProjectDocumentMapper documentMapper;

    @Override
    public void save(Project project) {
        log.debug("Saving project with ID: {}", project.getId());
        jpaRepository.save(mapper.toEntity(project));
    }

    @Override
    public Optional<Project> findById(UUID id) {
        return jpaRepository.findByIdAndDeletedAtIsNull(id)
                .map(entity -> mapper.toDomain(entity, documentsFor(id)));
    }

    @Override
    public List<Project> findAllByLaboratoryId(UUID laboratoryId) {
        var entities = jpaRepository.findAllByLaboratoryIdAndDeletedAtIsNull(laboratoryId);
        return entities.stream()
                .map(entity -> mapper.toDomain(entity, documentsFor(entity.getId())))
                .collect(Collectors.toList());
    }

    private List<ProjectDocument> documentsFor(UUID projectId) {
        return documentMapper.toDomainList(documentJpaRepository.findAllByProjectIdOrderByUploadedAtAsc(projectId));
    }
}
