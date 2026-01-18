package com.zayeni.training.util;

import com.zayeni.training.model.Role;
import com.zayeni.training.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        ensureRole("ROLE_ADMIN", "Administrateur du système");
        ensureRole("ROLE_FORMATEUR", "Enseignant / Formateur");
        ensureRole("ROLE_ETUDIANT", "Étudiant");
    }

    private void ensureRole(String name, String description) {
        if (roleRepository.findByName(name) == null) {
            Role role = new Role();
            role.setName(name);
            role.setDescription(description);
            roleRepository.save(role);
        }
    }
}
