package com.mylab.backend.researchgroup.domain.valueobjects;

import java.util.regex.Pattern;

import com.mylab.backend.researchgroup.domain.exception.InvalidGroupContactException;

import lombok.Builder;
import lombok.Value;

@Value

public class GroupContact {
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    String phone;
    String fax;
    String email;
    String website;

    @Builder
    public GroupContact(String phone, String fax, String email, String website) {
        this.phone = phone;
        this.fax = fax;
        this.email = validateEmail(email);
        this.website = website;
}

private static String validateEmail(String email) {
    if (email == null || email.isBlank()) {
        return null;
    }

    if (EMAIL_PATTERN.matcher(email).matches()) {
        return email;
    } else {
        throw new InvalidGroupContactException("Invalid email format: " + email);

    }
}
}
