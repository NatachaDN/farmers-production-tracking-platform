package com.farmer.tracking.modules.auth.service;

/**
 * Verified identity of a Google account.
 *
 * @param subject  stable Google account id ("sub")
 * @param email    email address, already verified by Google
 * @param name     display name, may be null
 * @param pictureUrl profile picture URL, may be null
 */
public record GoogleIdentity(String subject, String email, String name, String pictureUrl) {}
