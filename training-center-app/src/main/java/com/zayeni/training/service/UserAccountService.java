package com.zayeni.training.service;

import java.util.Collections;
import java.security.SecureRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.zayeni.training.model.Role;
import com.zayeni.training.model.User;
import com.zayeni.training.repository.RoleRepository;
import com.zayeni.training.repository.UserRepository;

@Service
public class UserAccountService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    public void createAccountFor(String email, String name, String roleName) {
        if (userRepository.findByUsername(email) == null) {
            User user = new User();
            user.setUsername(email);

            // Generate random password
            String randomPassword = generateRandomPassword(10);

            user.setPassword(passwordEncoder.encode(randomPassword));
            user.setEnabled(true);
            user.setActived(true);

            Role role = roleRepository.findByName(roleName);
            if (role != null) {
                user.setRoles(Collections.singletonList(role));
            }

            userRepository.save(user);

            // Send credentials via email
            emailService.sendCredentials(email, randomPassword, name);
        }
    }

    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            int randomIndex = random.nextInt(chars.length());
            sb.append(chars.charAt(randomIndex));
        }
        return sb.toString();
    }
}
