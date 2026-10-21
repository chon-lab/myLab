package com.mylab.backend.common.domain.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class TextCaseNormalizer {
    private static final Locale PORTUGUESE = Locale.forLanguageTag("pt-BR");
    private static final Set<String> LOWERCASE_NAME_PARTICLES = Set.of(
            "da", "das", "de", "do", "dos", "e", "del", "della", "van", "von"
    );
    private static final Pattern NAME_TOKEN = Pattern.compile("[\\p{L}\\p{M}]+|[^\\p{L}\\p{M}]+");
    private static final Pattern SENTENCE_START = Pattern.compile("(^|[.!?]\\s+)(\\p{L})");

    private TextCaseNormalizer() {
    }

    public static String personName(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }

        String normalized = value.trim().replaceAll("\\s+", " ").toLowerCase(PORTUGUESE);
        Matcher matcher = NAME_TOKEN.matcher(normalized);
        StringBuilder result = new StringBuilder();
        boolean firstWord = true;

        while (matcher.find()) {
            String token = matcher.group();
            if (!Character.isLetter(token.codePointAt(0))) {
                result.append(token);
                continue;
            }

            if (firstWord || !LOWERCASE_NAME_PARTICLES.contains(token)) {
                int firstCharacterLength = Character.charCount(token.codePointAt(0));
                result.append(token.substring(0, firstCharacterLength).toUpperCase(PORTUGUESE));
                result.append(token.substring(firstCharacterLength));
            } else {
                result.append(token);
            }
            firstWord = false;
        }

        return result.toString();
    }

    public static String sentence(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }

        String normalized = value.trim().toLowerCase(PORTUGUESE);
        Matcher matcher = SENTENCE_START.matcher(normalized);
        StringBuffer result = new StringBuffer();
        while (matcher.find()) {
            matcher.appendReplacement(
                    result,
                    Matcher.quoteReplacement(matcher.group(1) + matcher.group(2).toUpperCase(PORTUGUESE))
            );
        }
        matcher.appendTail(result);
        return result.toString();
    }

    public static List<String> sentences(List<String> values) {
        if (values == null) {
            return List.of();
        }

        List<String> normalized = new ArrayList<>(values.size());
        for (String value : values) {
            normalized.add(sentence(value));
        }
        return List.copyOf(normalized);
    }
}
