package com.mylab.backend.person.application.port.in;

import java.util.UUID;

import com.mylab.backend.person.application.dto.CreatePersonInput;

public interface CreatePersonPort {
  UUID create(CreatePersonInput input);
}
