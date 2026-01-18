package com.zayeni.training.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.zayeni.training.model.User;

public interface UserRepository extends JpaRepository<User, String> {
    User findByUsername(String username);
}
