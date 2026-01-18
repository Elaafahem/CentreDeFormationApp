package com.zayeni.training.security;

import com.zayeni.training.dto.*;
import com.zayeni.training.model.*;
import com.zayeni.training.repository.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    EtudiantRepository etudiantRepository;

    @Autowired
    FormateurRepository formateurRepository;

    @Autowired
    SpecialiteRepository specialiteRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        org.springframework.security.core.userdetails.UserDetails userDetails = (org.springframework.security.core.userdetails.UserDetails) authentication
                .getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        String formateurEmail = null;
        if (roles.contains("ROLE_FORMATEUR")) {
            formateurEmail = userDetails.getUsername();
        }

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getUsername(),
                roles,
                formateurEmail));
    }

    @PostMapping("/register/student")
    public ResponseEntity<?> registerStudent(@Valid @RequestBody StudentRegisterRequest signUpRequest) {
        if (userRepository.findByUsername(signUpRequest.getEmail()) != null) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Email is already in use!");
        }

        // Create new user's account
        User user = new User(signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()),
                true,
                Collections.singletonList(roleRepository.findByName("ROLE_ETUDIANT")));

        userRepository.save(user);

        // Create Etudiant entity
        Etudiant etudiant = new Etudiant(signUpRequest.getMatricule(),
                signUpRequest.getNom(),
                signUpRequest.getPrenom(),
                signUpRequest.getEmail(),
                new Date());

        etudiantRepository.save(etudiant);

        return ResponseEntity.ok("Student registered successfully!");
    }

    @PostMapping("/register/trainer")
    @SuppressWarnings("null")
    public ResponseEntity<?> registerTrainer(@Valid @RequestBody TrainerRegisterRequest signUpRequest) {
        if (userRepository.findByUsername(signUpRequest.getEmail()) != null) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Email is already in use!");
        }

        Specialite spec = specialiteRepository.findById(signUpRequest.getSpecialiteId())
                .orElse(null);

        if (spec == null) {
            return ResponseEntity.badRequest().body("Error: Specialite not found!");
        }

        // Create new user's account
        User user = new User(signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()),
                true,
                Collections.singletonList(roleRepository.findByName("ROLE_FORMATEUR")));

        userRepository.save(user);

        // Create Formateur entity
        Formateur formateur = new Formateur(signUpRequest.getNom(), spec, signUpRequest.getEmail());
        formateurRepository.save(formateur);

        return ResponseEntity.ok("Trainer registered successfully!");
    }
}
