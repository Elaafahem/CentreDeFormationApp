package com.zayeni.training.repository;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.zayeni.training.model.Seance;

public interface SeanceRepository extends JpaRepository<Seance, Long> {
    List<Seance> findByDateSeance(LocalDate dateSeance);

    List<Seance> findByCours_Formateur_Email(String email);

    List<Seance> findByCours_Groupes_Etudiants_Email(String email);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT s FROM Seance s WHERE s.cours.id IN " +
            "(SELECT DISTINCT i.cours.id FROM Inscription i WHERE LOWER(i.etudiant.email) = LOWER(:email)) " +
            "OR s.cours.id IN " +
            "(SELECT DISTINCT c.id FROM Cours c JOIN c.groupes g JOIN g.etudiants e WHERE LOWER(e.email) = LOWER(:email))")
    List<Seance> findByEtudiantEmail(@org.springframework.data.repository.query.Param("email") String email);
}
