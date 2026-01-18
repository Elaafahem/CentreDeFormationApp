package com.zayeni.training.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.zayeni.training.model.Cours;

public interface CoursRepository extends JpaRepository<Cours, Long> {
    Cours findByTitre(String titre);

    Long countByFormateurId(Long formateurId);

    List<Cours> findByFormateur_Email(String email);

    List<Cours> findByGroupes_Etudiants_Email(String email);

    List<Cours> findByFormateur_Id(Long formateurId);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT c FROM Cours c WHERE c.id IN (SELECT DISTINCT i.cours.id FROM Inscription i WHERE LOWER(i.etudiant.email) = LOWER(:email)) OR c.id IN (SELECT DISTINCT c2.id FROM Cours c2 JOIN c2.groupes g JOIN g.etudiants e WHERE LOWER(e.email) = LOWER(:email))")
    List<Cours> findByEtudiantEmail(@org.springframework.data.repository.query.Param("email") String email);
}
