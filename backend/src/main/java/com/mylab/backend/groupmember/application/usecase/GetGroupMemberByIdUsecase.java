package com.mylab.backend.groupmember.application.usecase;

import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.groupmember.application.exception.GroupMemberNotFoundException;
import com.mylab.backend.groupmember.application.port.in.GetGroupMemberPort;
import com.mylab.backend.groupmember.application.port.out.GroupMemberRepositoryPort;
import com.mylab.backend.groupmember.domain.model.GroupMember;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GetGroupMemberByIdUsecase implements GetGroupMemberPort {

    private final GroupMemberRepositoryPort repositoryPort;

    @Override
    @Transactional(readOnly = true)
    public GroupMember get(UUID id) {
        Objects.requireNonNull(id, "id must not be null");
        log.debug("Finding group member by ID: {}", id);
        return repositoryPort.findById(id)
                .orElseThrow(() -> new GroupMemberNotFoundException(id));
    }
}
