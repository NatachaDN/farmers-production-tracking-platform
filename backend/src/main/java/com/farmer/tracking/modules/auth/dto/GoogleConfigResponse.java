package com.farmer.tracking.modules.auth.dto;

/**
 * Public settings the browser needs to start Google sign-in. The client id is not a secret.
 */
public record GoogleConfigResponse(boolean enabled, String clientId) {}
