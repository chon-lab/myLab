package com.mylab.backend.researchline.application.port.in;

import java.util.UUID;

import com.mylab.backend.researchline.application.dto.CreateResearchLineInput;

public interface CreateResearchLinePort {
  UUID create(CreateResearchLineInput input);
}
