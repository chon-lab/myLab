package com.mylab.backend.person.infrastructure.adapters.in.rest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mylab.backend.common.infrastructure.auth.CurrentPersonProvider;
import com.mylab.backend.person.infrastructure.adapters.in.rest.dto.PersonResponse;
import com.mylab.backend.person.infrastructure.adapters.in.rest.mapper.PersonRestMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
public class MeController {

    private final CurrentPersonProvider currentPersonProvider;
    private final PersonRestMapper mapper;

    @GetMapping("/api/v1/me")
    public PersonResponse getCurrentPerson() {
        log.info("REST GET: resolve current authenticated person");
        return mapper.toResponse(currentPersonProvider.current());
    }
}
