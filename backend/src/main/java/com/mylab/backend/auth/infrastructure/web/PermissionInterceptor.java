package com.mylab.backend.auth.infrastructure.web;

import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;

import org.jspecify.annotations.Nullable;
import org.springframework.http.HttpMethod;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import com.mylab.backend.auth.application.PermissionChecker;
import com.mylab.backend.auth.infrastructure.CurrentPersonProvider;
import com.mylab.backend.role.domain.model.PermissionAction;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class PermissionInterceptor implements HandlerInterceptor {

  private static final String API_PREFIX = "/api/v1/";
  private static final String RESEARCH_GROUPS = "research-groups";

  private final PermissionChecker permissionChecker;
  private final CurrentPersonProvider currentPersonProvider;
  private final GroupResolver groupResolver;

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
    if (!(handler instanceof HandlerMethod handlerMethod)) {
      return true;
    }

    RequiredPermission required = requiredPermission(handlerMethod);
    if (required == null) {
      return true;
    }

    String path = request.getRequestURI();
    if (path == null || !path.startsWith(API_PREFIX)) {
      return true;
    }

    String[] segments = path.substring(API_PREFIX.length()).split("/");
    Optional<UUID> groupId = resolveGroupId(segments);
    if (groupId.isEmpty()) {
      return true;
    }

    PermissionAction action = actionFromHttpMethod(request.getMethod());
    permissionChecker.require(currentPersonProvider.current().getId(), groupId.get(), required.resource(), action);
    return true;
  }

  @Nullable
  private RequiredPermission requiredPermission(HandlerMethod handlerMethod) {
    RequiredPermission onMethod = handlerMethod.getMethodAnnotation(RequiredPermission.class);
    return onMethod != null ? onMethod : handlerMethod.getBeanType().getAnnotation(RequiredPermission.class);
  }

  private PermissionAction actionFromHttpMethod(String httpMethod) {
    if (HttpMethod.GET.matches(httpMethod) || HttpMethod.HEAD.matches(httpMethod)) {
      return PermissionAction.READ;
    }
    if (HttpMethod.DELETE.matches(httpMethod)) {
      return PermissionAction.DELETE;
    }
    return PermissionAction.WRITE;
  }

  private Optional<UUID> resolveGroupId(String[] segments) {
    if (segments.length < 2) {
      return Optional.empty();
    }
    if (RESEARCH_GROUPS.equals(segments[0])) {
      return Optional.ofNullable(parseUuid(segments[1]));
    }
    return resolveGroupByEntity(segments);
  }

  private Optional<UUID> resolveGroupByEntity(String[] segments) {
    return switch (segments[0]) {
      case "research-lines" -> byId(segments[1], groupResolver::byResearchLine);
      case "members" -> byId(segments[1], groupResolver::byMember);
      case "laboratories" -> byId(segments[1], groupResolver::byLaboratory);
      case "projects" -> byId(segments[1], groupResolver::byProject);
      case "inventory" -> resolveInventoryGroup(segments);
      default -> Optional.empty();
    };
  }

  private Optional<UUID> resolveInventoryGroup(String[] segments) {
    if (segments.length < 3) {
      return Optional.empty();
    }
    return switch (segments[1]) {
      case "items" -> byId(segments[2], groupResolver::byInventoryItem);
      case "entries", "exits", "transfers" -> byId(segments[2], groupResolver::byMovement);
      default -> Optional.empty();
    };
  }

  private Optional<UUID> byId(String rawId, Function<UUID, Optional<UUID>> resolver) {
    UUID id = parseUuid(rawId);
    return id == null ? Optional.empty() : resolver.apply(id);
  }

  @Nullable
  private UUID parseUuid(String value) {
    try {
      return UUID.fromString(value);
    } catch (IllegalArgumentException exception) {
      return null;
    }
  }
}
