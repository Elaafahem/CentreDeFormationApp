package com.zayeni.training.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.zayeni.training.model.Groupe;

import com.zayeni.training.model.Session;

public interface GroupeRepository extends JpaRepository<Groupe, Long> {
    java.util.List<Groupe> findDistinctByCours_Formateur_Email(String email);

    long countBySession(Session session);
}
