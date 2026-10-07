package com.farmer.tracking.common.security;

import com.farmer.tracking.modules.auth.model.Farmer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String emailOrPhone;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Long id, String emailOrPhone, String password, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.emailOrPhone = emailOrPhone;
        this.password = password;
        this.authorities = authorities;
    }

    public static UserPrincipal create(Farmer farmer) {
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(farmer.getRole()));
        return new UserPrincipal(
                farmer.getId(),
                farmer.getEmailOrPhone(),
                farmer.getPasswordHash(),
                authorities
        );
    }

    public Long getId() {
        return id;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return emailOrPhone;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
