package com.zayeni.training.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.zayeni.training.model.Specialite;

public interface SpecialiteRepository extends JpaRepository<Specialite, Long> {
    Specialite findByNom(String nom);
}
