package com.farmer.tracking.modules.auth;

import com.farmer.tracking.common.exception.UnauthorizedException;
import com.farmer.tracking.common.security.AdminAccessPolicy;
import com.farmer.tracking.common.security.JwtTokenProvider;
import com.farmer.tracking.modules.auth.mapper.AuthMapper;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.auth.service.GoogleAuthService;
import com.farmer.tracking.modules.auth.service.GoogleIdentity;
import com.farmer.tracking.modules.auth.service.GoogleOAuthClient;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class GoogleAuthServiceTest {
    private final FarmerRepository repository = mock(FarmerRepository.class);
    private final JwtTokenProvider tokens = mock(JwtTokenProvider.class);
    private final GoogleAuthService service = new GoogleAuthService(mock(GoogleOAuthClient.class),
            repository, new AuthMapper(), mock(PasswordEncoder.class), tokens, new AdminAccessPolicy(""));

    @Test
    void rejectsDifferentSubjectForAnAlreadyLinkedEmail() {
        Farmer farmer = new Farmer();
        farmer.setGoogleId("existing-google-account");
        when(repository.findLockedByEmailOrPhone("farmer@gmail.com")).thenReturn(Optional.of(farmer));

        assertThrows(UnauthorizedException.class,
                () -> service.signIn(new GoogleIdentity("different-google-account", "farmer@gmail.com", null, null, true)));
        verify(repository, never()).save(any());
        verifyNoInteractions(tokens);
    }

    @Test
    void rejectsAutomaticLinkingWhenGoogleDoesNotHostTheEmail() {
        when(repository.findLockedByEmailOrPhone("farmer@example.com")).thenReturn(Optional.of(new Farmer()));

        assertThrows(UnauthorizedException.class,
                () -> service.signIn(new GoogleIdentity("google-account", "farmer@example.com", null, null, false)));
        verify(repository, never()).save(any());
        verifyNoInteractions(tokens);
    }
}
