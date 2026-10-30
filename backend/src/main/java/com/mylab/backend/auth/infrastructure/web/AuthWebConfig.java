package com.mylab.backend.auth.infrastructure.web;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.mylab.backend.auth.application.PermissionChecker;
import com.mylab.backend.auth.infrastructure.CurrentPersonProvider;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class AuthWebConfig implements WebMvcConfigurer {

  private final PermissionChecker permissionChecker;
  private final CurrentPersonProvider currentPersonProvider;
  private final GroupResolver groupResolver;

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(new PermissionInterceptor(
        permissionChecker,
        currentPersonProvider,
        groupResolver))
        .addPathPatterns("/api/v1/**");
  }
}
