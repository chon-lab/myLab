package com.mylab.backend.researchgroup.application.port.in;

import java.util.List;

import com.mylab.backend.researchgroup.domain.model.ResearchGroup;

public interface GetAllResearchGroupPort {
    List<ResearchGroup> getAll();
}
