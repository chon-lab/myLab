package com.mylab.backend.person.domain.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

import com.mylab.backend.person.domain.exception.InvalidPersonException;

import lombok.Builder;
import lombok.Getter;

@Getter
public class Person {
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private final UUID id;
    private final UUID researchGroupId;
    private String name;
    private String socialName;
    private String email;
    private String phone;
    private String cpf;
    private String academicDegree;
    private List<String> areasOfExpertise;
    private Set<UUID> researchLineIds;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    @Builder
    public Person(
            UUID id,
            UUID researchGroupId,
            String name,
            String socialName,
            String email,
            String phone,
            String cpf,
            String academicDegree,
            List<String> areasOfExpertise,
            Set<UUID> researchLineIds,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            LocalDateTime deletedAt) {
        this.id = requireNonNull(id, "id");
        this.researchGroupId = requireNonNull(researchGroupId, "researchGroupId");
        this.name = requireNonBlank(name, "name");
        this.socialName = socialName;
        this.email = validateEmail(email);
        this.phone = phone;
        this.cpf = validateCpf(cpf);
        this.academicDegree = academicDegree;
        this.areasOfExpertise = defaultIfNull(areasOfExpertise);
        this.researchLineIds = defaultIfNull(researchLineIds);
        this.createdAt = requireNonNull(createdAt, "createdAt");
        this.updatedAt = requireValidUpdatedAt(updatedAt, createdAt);
        this.deletedAt = deletedAt;
    }

    private static String requireNonBlank(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new InvalidPersonException(fieldName + " must not be blank");
        }
        return value;
    }

    private static <T> T requireNonNull(T value, String fieldName) {
        if (value == null) {
            throw new InvalidPersonException(fieldName + " must not be null");
        }
        return value;
    }

    private static String validateEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }

        if (EMAIL_PATTERN.matcher(email).matches()) {
            return email;
        }

        throw new InvalidPersonException("Invalid email format: " + email);
    }

    private static String validateCpf(String cpf) {
        if (cpf == null || cpf.isBlank()) {
            return null;
        }

        String digits = cpf.replaceAll("[\\s.-]", "");

        if (!digits.matches("\\d{11}")) {
            throw new InvalidPersonException("cpf must contain eleven digits");
        }

        return digits;
    }

    private static List<String> defaultIfNull(List<String> values) {
        return values == null ? List.of() : List.copyOf(values);
    }

    private static Set<UUID> defaultIfNull(Set<UUID> values) {
        return values == null ? Set.of() : Set.copyOf(values);
    }

    private static LocalDateTime requireValidUpdatedAt(
        LocalDateTime updatedAt,
        LocalDateTime createdAt
    ) {
        requireNonNull(updatedAt, "updatedAt");

        if (updatedAt.isBefore(createdAt)) {
            throw new InvalidPersonException(
                    "updatedAt must not be before createdAt"
            );
        }

        return updatedAt;
    }

    public void updateDetails(
            String name,
            String socialName,
            String email,
            String phone,
            String cpf,
            String academicDegree,
            List<String> areasOfExpertise,
            Set<UUID> researchLineIds,
            LocalDateTime occurredAt) {
        String validName = requireNonBlank(name, "name");
        String validEmail = validateEmail(email);
        String validCpf = validateCpf(cpf);
        LocalDateTime validUpdatedAt = requireValidUpdatedAt(occurredAt, this.createdAt);

        if (validUpdatedAt.isBefore(this.updatedAt)) {
            throw new InvalidPersonException("updatedAt must not move backwards");
        }

        this.name = validName;
        this.socialName = socialName;
        this.email = validEmail;
        this.phone = phone;
        this.cpf = validCpf;
        this.academicDegree = academicDegree;
        this.areasOfExpertise = defaultIfNull(areasOfExpertise);
        this.researchLineIds = defaultIfNull(researchLineIds);
        this.updatedAt = validUpdatedAt;
    }
}
