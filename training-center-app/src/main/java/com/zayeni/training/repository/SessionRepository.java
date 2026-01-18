package com.zayeni.training.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.zayeni.training.model.Session;

public interface SessionRepository extends JpaRepository<Session, Long> {
}
