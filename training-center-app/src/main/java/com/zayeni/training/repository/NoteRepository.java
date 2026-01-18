package com.zayeni.training.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.zayeni.training.model.Note;
import com.zayeni.training.model.Inscription;
import org.springframework.data.repository.query.Param;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByInscription(Inscription inscription);

    @org.springframework.data.jpa.repository.Query("SELECT n FROM Note n WHERE LOWER(n.inscription.cours.formateur.email) = LOWER(:email)")
    List<Note> findByInscription_Cours_Formateur_Email(@Param("email") String email);

    @org.springframework.data.jpa.repository.Query("SELECT n FROM Note n WHERE LOWER(n.inscription.etudiant.email) = LOWER(:email)")
    List<Note> findByInscription_Etudiant_Email(@Param("email") String email);

    @org.springframework.data.jpa.repository.Query("SELECT AVG(n.valeur) FROM Note n WHERE n.inscription.cours.id = :coursId")
    Double findAverageByCours(@org.springframework.web.bind.annotation.RequestParam("coursId") Long coursId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(n) FROM Note n WHERE n.inscription.cours.id = :coursId AND n.valeur >= 10")
    Long countPassedByCours(@org.springframework.web.bind.annotation.RequestParam("coursId") Long coursId);

    @org.springframework.data.jpa.repository.Query("SELECT AVG(n.valeur) FROM Note n WHERE n.inscription.etudiant.id = :etudiantId")
    Double findAverageByEtudiant(@Param("etudiantId") Long etudiantId);
}
