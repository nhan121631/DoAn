package com.ants.ktc.ants_ktc.services.auth;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserJpaRepository userRepository;

    public CustomUserDetailsService(UserJpaRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        List<GrantedAuthority> authorities = new ArrayList<>();
        user.getRoles().forEach(role -> {
            // Nếu dùng @PreAuthorize("hasAuthority('Administrators')") thì
            authorities.add(new SimpleGrantedAuthority(role.getName()));

            // Nếu dùng @PreAuthorize("hasRole('Administrators')") thì authorities.add(new
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
        });
        String password = user.getPassword() != null ? user.getPassword() : "";
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(password)
                .authorities(authorities)
                .build();
    }
}