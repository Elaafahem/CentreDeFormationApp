package com.zayeni.training.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.zayeni.training.model.Groupe;

public interface GroupeRepository extends JpaRepository<Groupe, Long> {
}
