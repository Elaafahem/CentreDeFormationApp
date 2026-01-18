package com.zayeni.training.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.zayeni.training.model.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Role findByName(String name);
}
