package com.zayeni.training.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.zayeni.training.model.Formateur;

public interface FormateurRepository extends JpaRepository<Formateur, Long> {
    List<Formateur> findByNom(String nom);

    Formateur findByEmail(String email);
}
