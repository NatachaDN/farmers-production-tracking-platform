package com.farmer.tracking.common.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class FarmerOwnershipFilterTest {

    private final FarmerOwnershipFilter filter = new FarmerOwnershipFilter();

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(Long farmerId, String role) {
        UserPrincipal principal = new UserPrincipal(farmerId, "user" + farmerId + "@example.com", "hash",
                List.of(new SimpleGrantedAuthority(role)));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
    }

    private MockHttpServletResponse run(String uri, MockFilterChain chain) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", uri);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, chain);
        return response;
    }

    @Test
    void allowsFarmerToAccessOwnData() throws Exception {
        authenticateAs(7L, "ROLE_FARMER");
        MockFilterChain chain = new MockFilterChain();

        MockHttpServletResponse response = run("/api/v1/farmers/7/plots", chain);

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(chain.getRequest()).isNotNull();
    }

    @Test
    void rejectsFarmerAccessingAnotherFarmersData() throws Exception {
        authenticateAs(7L, "ROLE_FARMER");
        MockFilterChain chain = new MockFilterChain();

        MockHttpServletResponse response = run("/api/v1/farmers/8/cycles/3/harvest", chain);

        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getContentAsString()).contains("only access your own data");
        assertThat(chain.getRequest()).isNull();
    }

    @Test
    void rejectsFarmerAccessingAnotherFarmersRootPath() throws Exception {
        authenticateAs(7L, "ROLE_FARMER");

        assertThat(run("/api/v1/farmers/8", new MockFilterChain()).getStatus()).isEqualTo(403);
    }

    @Test
    void allowsAdminToAccessAnyFarmersData() throws Exception {
        authenticateAs(1L, "ROLE_ADMIN");
        MockFilterChain chain = new MockFilterChain();

        MockHttpServletResponse response = run("/api/v1/farmers/8/plots", chain);

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(chain.getRequest()).isNotNull();
    }

    @Test
    void ignoresPathsThatAreNotFarmerScoped() throws Exception {
        authenticateAs(7L, "ROLE_FARMER");
        MockFilterChain chain = new MockFilterChain();

        run("/api/v1/farms/8", chain);

        assertThat(chain.getRequest()).isNotNull();
    }

    @Test
    void leavesUnauthenticatedRequestsToAuthorizationRules() throws Exception {
        MockFilterChain chain = new MockFilterChain();

        run("/api/v1/farmers/8/plots", chain);

        assertThat(chain.getRequest()).isNotNull();
    }
}
