package com.farmer.tracking.modules.auth.service;

import com.farmer.tracking.common.exception.ApiException;
import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.exception.UnauthorizedException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.time.Instant;

/**
 * Exchanges a Google authorization code for the signed-in user's identity (OAuth 2.0 code flow).
 * The client secret never leaves the server.
 */
@Component
public class GoogleOAuthClient {

    private static final Logger log = LoggerFactory.getLogger(GoogleOAuthClient.class);
    private static final String TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

    private final String clientId;
    private final String clientSecret;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public GoogleOAuthClient(@Value("${app.google.client-id:}") String clientId,
                             @Value("${app.google.client-secret:}") String clientSecret,
                             ObjectMapper objectMapper) {
        this.clientId = clientId == null ? "" : clientId.trim();
        this.clientSecret = clientSecret == null ? "" : clientSecret.trim();
        this.objectMapper = objectMapper;

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5_000);
        factory.setReadTimeout(10_000);
        this.restClient = RestClient.builder().requestFactory(factory).build();
    }

    public boolean isConfigured() {
        return !clientId.isEmpty() && !clientSecret.isEmpty();
    }

    public String getClientId() {
        return clientId;
    }

    public GoogleIdentity exchangeCode(String code, String redirectUri, String codeVerifier) {
        if (!isConfigured()) {
            throw new BadRequestException("Google sign-in is not configured on this server.");
        }

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("code", code);
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("redirect_uri", redirectUri);
        form.add("grant_type", "authorization_code");
        if (codeVerifier != null && !codeVerifier.isBlank()) {
            form.add("code_verifier", codeVerifier);
        }

        String body;
        try {
            body = restClient.post()
                    .uri(TOKEN_ENDPOINT)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(String.class);
        } catch (RestClientResponseException ex) {
            // Typical causes: expired/used code, redirect URI not registered, wrong client secret.
            log.warn("Google rejected the code exchange: HTTP {} {}", ex.getStatusCode().value(), ex.getResponseBodyAsString());
            throw new UnauthorizedException("Google rejected the sign-in request. Please try again.");
        } catch (RestClientException ex) {
            log.warn("Could not reach Google token endpoint: {}", ex.getMessage());
            throw new ApiException("Google could not be reached. Please try again in a moment.", HttpStatus.BAD_GATEWAY);
        }

        try {
            JsonNode json = objectMapper.readTree(body);
            String idToken = json.path("id_token").asText(null);
            return GoogleIdTokenParser.parse(idToken, clientId, Instant.now(), objectMapper);
        } catch (com.fasterxml.jackson.core.JsonProcessingException | NullPointerException ex) {
            throw new UnauthorizedException("Google sign-in could not be verified. Please try again.");
        }
    }
}
