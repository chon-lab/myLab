package com.mylab.backend.person.application.port.in;

import java.util.UUID;

public interface DeletePersonPort {
    void delete(UUID id);
}
