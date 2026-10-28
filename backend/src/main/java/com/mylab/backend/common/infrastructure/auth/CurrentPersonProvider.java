package com.mylab.backend.common.infrastructure.auth;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.person.application.port.out.PersonRepositoryPort;
import com.mylab.backend.person.domain.model.Person;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class CurrentPersonProvider {

    private final PersonRepositoryPort personRepositoryPort;

    @Transactional
    public Person current() {
        Jwt jwt = requireJwt();
        String email = jwt.getClaimAsString("email");

        if (email == null || email.isBlank()) {
            throw new UnresolvedCurrentPersonException("Authenticated token has no email claim");
        }

        return personRepositoryPort.findByEmail(email)
                .orElseGet(() -> provision(email, jwt));
    }

    private Person provision(String email, Jwt jwt) {
        log.info("Provisioning person on first login for subject: {}", jwt.getSubject());

        LocalDateTime now = LocalDateTime.now();
        Person person = Person.builder()
                .id(UUID.randomUUID())
                .name(resolveName(jwt, email))
                .email(email)
                .createdAt(now)
                .updatedAt(now)
                .build();

        personRepositoryPort.save(person);
        return person;
    }

    private String resolveName(Jwt jwt, String email) {
        String name = jwt.getClaimAsString("name");
        if (name != null && !name.isBlank()) {
            return name;
        }

        String preferredUsername = jwt.getClaimAsString("preferred_username");
        if (preferredUsername != null && !preferredUsername.isBlank()) {
            return preferredUsername;
        }

        return email.split("@")[0];
    }

    private Jwt requireJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof JwtAuthenticationToken token) {
            return token.getToken();
        }

        throw new UnresolvedCurrentPersonException("No authenticated JWT in the security context");
    }
}
