package com.zayeni.training.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.zayeni.training.model.Etudiant;

public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    List<Etudiant> findByNom(String nom);

    Etudiant findByEmail(String email);
}
