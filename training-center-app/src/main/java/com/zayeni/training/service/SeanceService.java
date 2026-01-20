package com.zayeni.training.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zayeni.training.model.Seance;
import com.zayeni.training.repository.SeanceRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SeanceService {

    @Autowired
    private SeanceRepository seanceRepository;

    @Autowired
    private com.zayeni.training.repository.CoursRepository coursRepository;

    @SuppressWarnings("null")
    public Seance save(Seance seance) {
        System.out.println("DEBUG: Tentative d'enregistrement d'une séance le " + seance.getDateSeance() +
                " de " + seance.getHeureDebut() + " à " + seance.getHeureFin() +
                " dans la salle " + seance.getSalle());

        // 0. Validation de base : Heure début < Heure fin
        if (seance.getHeureDebut() != null && seance.getHeureFin() != null) {
            if (!seance.getHeureDebut().isBefore(seance.getHeureFin())) {
                System.out.println("DEBUG: Erreur de validation - Heure de début après heure de fin");
                throw new RuntimeException("Erreur : L'heure de début doit impérativement être avant l'heure de fin.");
            }
        }

        // 1. Charger l'objet Cours complet pour avoir accès au formateur, groupes et
        // inscriptions
        if (seance.getCours() != null && seance.getCours().getId() != null) {
            seance.setCours(coursRepository.findById(seance.getCours().getId())
                    .orElseThrow(() -> new RuntimeException("Cours non trouvé")));
            System.out.println("DEBUG: Cours chargé: " + seance.getCours().getTitre());
        }

        // 2. Vérifier les conflits avec les séances existantes le même jour
        List<Seance> existingSeances = seanceRepository.findByDateSeance(seance.getDateSeance());
        System.out.println("DEBUG: " + existingSeances.size() + " séances existantes trouvées pour ce jour.");

        for (Seance s : existingSeances) {
            // Ignorer si c'est la même séance (cas d'une mise à jour)
            if (seance.getId() != null && s.getId().equals(seance.getId())) {
                continue;
            }

            // Vérifier le chevauchement horaire
            // Un chevauchement existe si : (debut1 < fin2) ET (fin1 > debut2)
            boolean overlap = seance.getHeureDebut().isBefore(s.getHeureFin()) &&
                    seance.getHeureFin().isAfter(s.getHeureDebut());

            if (overlap) {
                System.out.println("DEBUG: Chevauchement détecté avec la séance " + s.getId() + " (" + s.getHeureDebut()
                        + " - " + s.getHeureFin() + ")");
                // A. Conflit de Salle
                if (s.getSalle().equalsIgnoreCase(seance.getSalle())) {
                    String msg = "Conflit de Salle : La salle '" + s.getSalle() +
                            "' est déjà réservée pour le cours '" + s.getCours().getTitre() +
                            "' sur ce créneau (" + s.getHeureDebut() + " - " + s.getHeureFin() + ").";
                    System.out.println("DEBUG: " + msg);
                    throw new RuntimeException(msg);
                }

                // B. Conflit de Formateur
                if (s.getCours().getFormateur() != null && seance.getCours().getFormateur() != null) {
                    if (s.getCours().getFormateur().getId().equals(seance.getCours().getFormateur().getId())) {
                        String msg = "Conflit de Formateur : " + s.getCours().getFormateur().getNom() +
                                " est déjà occupé par le cours '" + s.getCours().getTitre() + "' à cette heure.";
                        System.out.println("DEBUG: " + msg);
                        throw new RuntimeException(msg);
                    }
                }

                // C. Conflit de Groupe
                if (s.getCours().getGroupes() != null && seance.getCours().getGroupes() != null) {
                    for (com.zayeni.training.model.Groupe ng : seance.getCours().getGroupes()) {
                        for (com.zayeni.training.model.Groupe eg : s.getCours().getGroupes()) {
                            if (ng.getId().equals(eg.getId())) {
                                String msg = "Conflit de Groupe : Le groupe '" + ng.getNom() +
                                        "' a déjà cours ('" + s.getCours().getTitre() + "') sur ce créneau horaire.";
                                System.out.println("DEBUG: " + msg);
                                throw new RuntimeException(msg);
                            }
                        }
                    }
                }

                // D. Conflit d'Étudiant (Inscriptions individuelles hors groupes)
                if (s.getCours().getInscriptions() != null && seance.getCours().getInscriptions() != null) {
                    for (com.zayeni.training.model.Inscription ni : seance.getCours().getInscriptions()) {
                        for (com.zayeni.training.model.Inscription ei : s.getCours().getInscriptions()) {
                            if (ni.getEtudiant().getId().equals(ei.getEtudiant().getId())) {
                                String msg = "Conflit Étudiant : L'étudiant " + ni.getEtudiant().getNom() +
                                        " est déjà inscrit au cours '" + s.getCours().getTitre()
                                        + "' qui se déroule au même moment.";
                                System.out.println("DEBUG: " + msg);
                                throw new RuntimeException(msg);
                            }
                        }
                    }
                }
            }
        }

        System.out.println("DEBUG: Aucun conflit trouvé. Enregistrement définitif...");
        return seanceRepository.save(seance);
    }

    @SuppressWarnings("null")
    public List<Seance> findAll() {
        return seanceRepository.findAll();
    }

    public Seance findById(Long id) {
        return seanceRepository.findById(id).orElse(null);
    }

    @SuppressWarnings("null")
    public void deleteById(Long id) {
        seanceRepository.deleteById(id);
    }

    public List<Seance> findByFormateurEmail(String email) {
        return seanceRepository.findByCours_Formateur_Email(email);
    }

    public List<Seance> findByEtudiantEmail(String email) {
        return seanceRepository.findByEtudiantEmail(email);
    }
}
