package com.farmer.tracking.modules.auth.dto;

import java.util.Set;

/**
 * Public settings the browser needs to start Google sign-in. The client id is not a secret.
 */
public record GoogleConfigResponse(boolean enabled, String clientId, Set<String> redirectUris) {}
