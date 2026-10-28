package com.farmer.tracking.common.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AdminAccessPolicyTest {

    @Test
    void matchesAllowListedEmails_ignoringCaseAndSpaces() {
        AdminAccessPolicy policy = new AdminAccessPolicy(" Boss@Acrea.test , second@acrea.test ");

        assertTrue(policy.isAdminEmail("boss@acrea.test"));
        assertTrue(policy.isAdminEmail("SECOND@acrea.test"));
        assertFalse(policy.isAdminEmail("someone@acrea.test"));
    }

    @Test
    void emptyList_grantsNobody() {
        AdminAccessPolicy policy = new AdminAccessPolicy("");

        assertFalse(policy.isAdminEmail("boss@acrea.test"));
        assertFalse(policy.isAdminEmail(null));
    }
}
