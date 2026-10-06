package com.farmer.tracking.common.exception;

/**
 * Thrown when a requested resource (cycle, activity, farmer, etc.) is not found.
 * The GlobalExceptionHandler maps this to an HTTP 404 response.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, Long id) {
        super(resourceName + " not found with id: " + id);
    }
}
