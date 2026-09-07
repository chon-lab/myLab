package com.mylab.backend.laboratory.application.port.in;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.laboratory.domain.model.Laboratory;

public interface GetAllLaboratoriesPort {
    List<Laboratory> getAllByResearchGroup(UUID researchGroupId);
}
