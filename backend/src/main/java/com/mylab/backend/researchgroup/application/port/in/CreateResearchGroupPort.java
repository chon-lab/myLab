package com.mylab.backend.researchgroup.application.port.in;

import java.util.UUID;

import com.mylab.backend.researchgroup.application.dto.CreateResearchGroupInput;

public interface CreateResearchGroupPort {
  UUID create(CreateResearchGroupInput input);
}
