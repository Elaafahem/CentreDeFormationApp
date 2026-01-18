package com.zayeni.training.service;

import java.util.Collections;

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

    public void createAccountFor(String email, String name, String roleName) {
        if (userRepository.findByUsername(email) == null) {
            User user = new User();
            user.setUsername(email);
            // Default password is "password" for new accounts
            user.setPassword(passwordEncoder.encode("password"));
            user.setEnabled(true);

            Role role = roleRepository.findByName(roleName);
            if (role != null) {
                user.setRoles(Collections.singletonList(role));
            }

            userRepository.save(user);
        }
    }
}
