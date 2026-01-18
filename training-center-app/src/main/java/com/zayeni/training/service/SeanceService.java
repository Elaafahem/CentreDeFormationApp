package com.zayeni.training.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zayeni.training.model.Seance;
import com.zayeni.training.repository.SeanceRepository;

@Service
public class SeanceService {

    @Autowired
    private SeanceRepository seanceRepository;

    @SuppressWarnings("null")
    public Seance save(Seance seance) {
        // Validation: Logic to check conflicts
        List<Seance> existingSeances = seanceRepository.findByDateSeance(seance.getDateSeance());

        for (Seance s : existingSeances) {
            // Skip if it is the same ID (update case)
            if (s.getId().equals(seance.getId()))
                continue;

            // Check Time Overlap
            if (seance.getHeureDebut().isBefore(s.getHeureFin()) && seance.getHeureFin().isAfter(s.getHeureDebut())) {

                // 1. Check Room Conflict
                if (s.getSalle().equalsIgnoreCase(seance.getSalle())) {
                    throw new RuntimeException("Conflit de Salle : La salle " + s.getSalle() + " est déjà occupée.");
                }

                // 2. Check Trainer Conflict (Formateur is in Cours)
                if (s.getCours().getFormateur().getId().equals(seance.getCours().getFormateur().getId())) {
                    throw new RuntimeException(
                            "Conflit de Formateur : " + s.getCours().getFormateur().getNom() + " a déjà cours.");
                }

                // 3. Check Student Conflict (Any student in both courses?)
                if (s.getCours().getInscriptions() != null && seance.getCours().getInscriptions() != null) {
                    for (com.zayeni.training.model.Inscription ni : seance.getCours().getInscriptions()) {
                        for (com.zayeni.training.model.Inscription ei : s.getCours().getInscriptions()) {
                            if (ni.getEtudiant().getId().equals(ei.getEtudiant().getId())) {
                                throw new RuntimeException("Conflit Étudiant : " + ni.getEtudiant().getNom()
                                        + " a déjà une séance prévue sur ce créneau.");
                            }
                        }
                    }
                }

                // 4. Check Group Conflict (Any group in both courses?)
                if (s.getCours().getGroupes() != null && seance.getCours().getGroupes() != null) {
                    for (com.zayeni.training.model.Groupe ng : seance.getCours().getGroupes()) {
                        for (com.zayeni.training.model.Groupe eg : s.getCours().getGroupes()) {
                            if (ng.getId().equals(eg.getId())) {
                                throw new RuntimeException("Conflit de Groupe : Le groupe " + ng.getNom()
                                        + " a déjà une séance prévue sur ce créneau.");
                            }
                        }
                    }
                }
            }
        }

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
}
