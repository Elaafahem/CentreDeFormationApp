package com.zayeni.training.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.zayeni.training.model.Inscription;
import com.zayeni.training.model.Etudiant;
import com.zayeni.training.model.Cours;

public interface InscriptionRepository extends JpaRepository<Inscription, Long> {
    List<Inscription> findByEtudiant_Id(Long etudiantId);

    List<Inscription> findByCours_Id(Long coursId);

    Inscription findByEtudiant_IdAndCours_Id(Long etudiantId, Long coursId);

    List<Inscription> findByCours_Formateur_EmailIgnoreCase(String email);

    List<Inscription> findByEtudiant_EmailIgnoreCase(String email);

    Long countByCours_Id(Long coursId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT i.etudiant.id) FROM Inscription i WHERE i.cours.formateur.id = :formateurId")
    Long countDistinctEtudiantsByFormateurId(
            @org.springframework.data.repository.query.Param("formateurId") Long formateurId);

    Inscription findByEtudiantAndCours(Etudiant etudiant, Cours cours);

    List<Inscription> findByEtudiant_Groupe_IdAndCours_Id(Long groupeId, Long coursId);
}
