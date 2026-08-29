package de.techcorp.ats.config;

import de.techcorp.ats.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/v1/health").permitAll()
                        .requestMatchers("/api/v1/auth/login", "/api/v1/auth/login/json", "/api/v1/auth/register-candidate").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/departments").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/jobs/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/applications").permitAll()
                        
                        // Documentation, Actuator & H2 console
                        .requestMatchers(
                                "/docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/api/v1/openapi.json",
                                "/actuator/**",
                                "/h2-console/**"
                        ).permitAll()

                        // Admin-only endpoints
                        .requestMatchers("/api/v1/users/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/compliance/run-cleanup-job").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/departments").hasRole("ADMIN")

                        // Recruiter & Admin endpoints
                        .requestMatchers(HttpMethod.POST, "/api/v1/jobs").hasAnyRole("ADMIN", "RECRUITER")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/jobs/**").hasAnyRole("ADMIN", "RECRUITER")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/jobs/**").hasAnyRole("ADMIN", "RECRUITER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/applications").hasAnyRole("ADMIN", "RECRUITER")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/applications/*/status").hasAnyRole("ADMIN", "RECRUITER")
                        .requestMatchers("/api/v1/compliance/applications/*/anonymize").hasAnyRole("ADMIN", "RECRUITER")
                        .requestMatchers("/api/v1/applications/*/notes/**").hasAnyRole("ADMIN", "RECRUITER")

                        // Authenticated user endpoints (Candidates, Recruiters, Admins)
                        .requestMatchers("/api/v1/auth/me").authenticated()
                        .requestMatchers("/api/v1/applications/my").authenticated()
                        .requestMatchers("/api/v1/applications/*/withdraw").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/applications/*/documents/*").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/applications/*").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/applications/*").authenticated()

                        // Any other request
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
