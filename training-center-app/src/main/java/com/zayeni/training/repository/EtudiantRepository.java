package com.zayeni.training.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.zayeni.training.model.Etudiant;

public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    List<Etudiant> findByNom(String nom);

    Etudiant findByEmail(String email);

    List<Etudiant> findByGroupe_Id(Long groupeId);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT e FROM Etudiant e LEFT JOIN FETCH e.inscriptions")
    List<Etudiant> findAllWithInscriptions();

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT e FROM Etudiant e LEFT JOIN FETCH e.inscriptions WHERE e.id = :id")
    java.util.Optional<Etudiant> findByIdWithInscriptions(
            @org.springframework.data.repository.query.Param("id") Long id);

    long countByGroupeSession(com.zayeni.training.model.Session session);
}
