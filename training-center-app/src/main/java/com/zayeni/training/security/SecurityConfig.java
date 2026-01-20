package com.zayeni.training.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

        @Autowired
        private UserDetailsService userDetailsService;

        @Bean
        public JwtAuthenticationFilter jwtAuthenticationFilter() {
                return new JwtAuthenticationFilter();
        }

        // API Security - Returns 401 instead of redirect to login page
        @Bean
        @Order(1)
        public SecurityFilterChain apiSecurityFilterChain(HttpSecurity http) throws Exception {
                http
                                .securityMatcher("/api/**")
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())
                                .authorizeHttpRequests(auth -> auth
                                                // Allow all GET requests to API (for React frontend to work)
                                                .requestMatchers(HttpMethod.GET, "/api/**").permitAll()
                                                .requestMatchers("/api/auth/**").permitAll()

                                                // Write access restrictions
                                                .requestMatchers(HttpMethod.POST, "/api/cours/**")
                                                .hasAnyRole("ADMIN", "FORMATEUR")
                                                .requestMatchers(HttpMethod.PUT, "/api/cours/**")
                                                .hasAnyRole("ADMIN", "FORMATEUR")
                                                .requestMatchers(HttpMethod.DELETE, "/api/cours/**").hasRole("ADMIN")

                                                .requestMatchers(HttpMethod.POST, "/api/notes/**")
                                                .hasAnyRole("ADMIN", "FORMATEUR")
                                                .requestMatchers(HttpMethod.PUT, "/api/notes/**")
                                                .hasAnyRole("ADMIN", "FORMATEUR")

                                                .requestMatchers("/api/etudiants/**").hasRole("ADMIN")
                                                .requestMatchers("/api/formateurs/**").hasRole("ADMIN")

                                                .anyRequest().authenticated())
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint(
                                                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)));

                http.addFilterBefore(jwtAuthenticationFilter(),
                                org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        // Web Security - Traditional form login for Thymeleaf
        @Bean
        @Order(2)
        public SecurityFilterChain webSecurityFilterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(new AntPathRequestMatcher("/login")).permitAll()
                                                .requestMatchers(new AntPathRequestMatcher("/css/**")).permitAll()
                                                .requestMatchers(new AntPathRequestMatcher("/js/**")).permitAll()
                                                .requestMatchers(new AntPathRequestMatcher("/h2-console/**"))
                                                .permitAll()

                                                // Thymeleaf admin pages
                                                .requestMatchers("/etudiants/**", "/formateurs/**", "/cours/**")
                                                .hasRole("ADMIN")

                                                .anyRequest().authenticated())
                                .formLogin(form -> form
                                                .loginPage("/login")
                                                .defaultSuccessUrl("/dashboard", true)
                                                .permitAll())
                                .logout(logout -> logout
                                                .logoutSuccessUrl("/login?logout")
                                                .permitAll())
                                .headers(headers -> headers.frameOptions(f -> f.disable()));

                return http.build();
        }

        @Bean
        public DaoAuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
                authProvider.setUserDetailsService(userDetailsService);
                authProvider.setPasswordEncoder(passwordEncoder());
                return authProvider;
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
                return authConfig.getAuthenticationManager();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(Arrays.asList("http://localhost:8081", "http://localhost:5173",
                                "http://localhost:3000", "http://localhost:3001"));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
                configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "x-auth-token"));
                configuration.setExposedHeaders(Arrays.asList("x-auth-token"));
                configuration.setAllowCredentials(true);
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
