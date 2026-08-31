package com.mylab.backend.person.application.port.in;

import java.util.UUID;

import com.mylab.backend.person.application.dto.UpdatePersonInput;

public interface UpdatePersonPort {
    void update(UUID id, UpdatePersonInput input);
}
